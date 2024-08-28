<script lang="ts">
    import Logo from '../../assets/logo.svg';
</script>

<div class="top-header py-1">
    <div class="container-md">
        <div class="row align-items-center">
            <div class="col d-flex align-items-center">
                <img src={Logo} alt="OnChain Coin Data" class="logo-img" />
                <div>
                    <h1 class="fs-3 m-0 p-0">OnChain Coin Data</h1>
                    <small class="d-block" style="margin-top: -5px"
                        >Collecting ERC-20 metadata for everyone</small>
                </div>
            </div>
            <!-- <div class="col col-auto">
                <div v-if="error" class="text-danger error">error: {{error}}</div>
                <div v-else-if="isConnected">{{address}}</div>
            </div>
            <div class="col col-auto">
                <button class="btn btn-primary" v-if="!isConnected">Connect</button>
            </div> -->
        </div>
    </div>
</div>

<style lang="scss">
    .logo-img {
        width: 3rem;
        height: 3rem;
        margin-right: 0.5rem;
    }
</style>
