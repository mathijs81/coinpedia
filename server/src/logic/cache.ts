// Cache using keyv
import KeyvSqlite from '@keyv/sqlite';
import Keyv from 'keyv';

const keyvSqlite = new KeyvSqlite('sqlite://coins.sqlite');
export const keyv = new Keyv({ store: keyvSqlite, namespace: 'coin' });

export const apeCache = new Keyv({ store: keyvSqlite, namespace: 'ape' });

export const signCache = new Keyv({ store: keyvSqlite, namespace: 'sign', ttl: 5 * 60 * 1000 });
