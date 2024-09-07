/* got trustwallet token list:

```
cd /tmp
mkdir assets
cd assets
git clone https://github.com/trustwallet/assets.git
```
relevant data is now in /tmp/assets/assets/blockchains/base/assets/[address]
and each dir has an info.json and logo.png
*/

import { promises as fs } from 'fs';
import {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import 'dotenv/config';
import { SocialNetwork } from '../logic/types';
import { writeToString } from '@fast-csv/format';
import { getAddress } from 'viem';

async function main() {
  const baseDir = '/tmp/assets/assets/blockchains/base/assets';
  const addresses = await fs.readdir(baseDir);

  const symbolMap = new Map<string, any>();

  const output = 'importcoins.csv';
  const headers = ['address', 'description', 'icon', 'website', 'socials'];
  await fs.writeFile(output, headers.join(',') + '\n');
  for (const address of addresses) {
    const info = JSON.parse(await fs.readFile(`${baseDir}/${address}/info.json`, 'utf-8'));

    const symbol = info.symbol.toLowerCase();
    let usedSymbol = symbol;
    let index = 1;
    while (symbolMap.has(usedSymbol)) {
      usedSymbol = `${symbol}${index}`;
      index++;
    }
    if (usedSymbol !== symbol) {
      console.log(`${symbol} ${address} --> ${usedSymbol}`);
    }
    symbolMap.set(usedSymbol, info);

    // upload logo as usedSymbol.png
    /*
        const logo = await fs.readFile(`${baseDir}/${address}/logo.png`);
        const s3Client = new S3Client({
            region:'auto',
            endpoint: process.env.CLOUDFLARE_ENDPOINT as string,
            credentials: {
                accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY as string,
                secretAccessKey: process.env.CLOUDFLARE_SECRET_KEY as string
            }
        });
        const bucketName = 'coinpedia';
        const params = {
            Bucket: bucketName,
            Key: `${usedSymbol}.png`,
            Body: logo,
            ContentType: 'image/png',
            ACL: ObjectCannedACL.public_read
        };
        await s3Client.send(new PutObjectCommand(params));
        */
    const icon = 'https://coinimg.vogelcode.com/' + usedSymbol + '.png';
    console.log(info);
    let description = info.description as string;
    if (description.length > 240) {
      description = shorten(description);
    }
    let socials: any[] = [];
    if (info.links) {
      info.links.forEach((element: any) => {
        if (element.name === 'telegram') {
          socials.push({ type: SocialNetwork.TELEGRAM, url: element.url });
        } else if (element.name === 'discord') {
          socials.push({ type: SocialNetwork.DISCORD, url: element.url });
        } else if (element.name === 'twitter') {
          socials.push({ type: SocialNetwork.X, url: element.url });
        }
      });
    }
    const socialsStr = JSON.stringify(socials);
    // socials can contain commas, form proper csv str:
    const record = [getAddress(info.id), description, icon, info.website, socialsStr];
    await fs.appendFile(output, (await writeToString([record])) + '\n');
  }
}

function shorten(desc: string): string {
  // Find a period in charachters 120..240
  let period = desc.lastIndexOf('.', 240);
  if (period >= 120) {
    return desc.substring(0, period + 1);
  } else {
    return desc.substring(0, 237) + '...';
  }
}

main().catch(console.error);
