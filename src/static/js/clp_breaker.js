$(function() {
  consoleToolsClpInit(main)
});

async function main() {
  const App = await init_ethers();

    let connectedNetwork = await App.provider.getNetwork();
    let connectedNetworkName = networkNameFromId(connectedNetwork.chainId);

    const targetNetworkNfts = ClpFactories.filter(c => c.network.toLowerCase() === connectedNetworkName.toLowerCase());

    _print_bold(`Your NFTs on ${connectedNetworkName} are`);
    _print_bold(`--------------------------------------------`);
    _print_bold("");

    for(nftObj of targetNetworkNfts){
      const NFT = new ethers.Contract(nftObj.nftAddress, AERO_NFT_MANAGER_ABI, App.provider);
      const ownedNfts = await NFT.balanceOf(App.YOUR_ADDRESS) / 1;
      if(ownedNfts <= 0){
        _print(`You dont have (${nftObj.nftAddress}) NFT to break on ${connectedNetworkName} network`);
        _print("");
      }
      for(let i = 0; i < ownedNfts; i++){
        const nftId = await NFT.tokenOfOwnerByIndex(App.YOUR_ADDRESS, i);
        const positions = await NFT.positions(nftId);
        const liquidity = positions[7];
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const nftAddress = nftObj.nftAddress;
        const amount0Max = positions[10];
        const amount1Max = positions[11];
        const params = {
          tokenId: nftId,
          liquidity: liquidity,
          amount0Min: 0,
          amount1Min: 0,
          deadline: currentTimestamp + 500,
        }
        const collectParams = {
          tokenId: nftId,
          recipient: App.YOUR_ADDRESS,
          amount0Max: amount0Max,
          amount1Max: amount1Max,
        }
        const withdraw = async function() {
          return cl_withdraw(params, nftAddress, App)
        }
        const collect = async function() {
          return cl_collect(collectParams, nftAddress, App)
        }
        const burn = async function() {
          return cl_burn(nftId, nftAddress, App)
        }
        _print(`NFT ID: ${nftId} NFT ADDRESS: ${nftObj.nftAddress}`);
        _print_link(`BREAK NFT`, withdraw);
        _print_link(`COLLECT YOUR TOKENS`, collect);
        _print_link(`BURN YOUR NFT`, burn);
        _print("");
      }
    }

    hideLoading();
}

const cl_withdraw = async function(params, nftAddress, App) {
  const signer = App.provider.getSigner()

  const NFT_MANAGER = new ethers.Contract(nftAddress, AERO_NFT_MANAGER_ABI, signer);

    showLoading()
    NFT_MANAGER.decreaseLiquidity(params)
      .then(function(t) {
        return App.provider.waitForTransaction(t.hash)
          .then(t => refresh(t.hash))
          .catch(err => transactionFailed(err));
      })
      .catch(function(err) {
        console.log(err)
        hideLoading()
      })
}

const cl_collect = async function(params, nftAddress, App) {
  const signer = App.provider.getSigner()

  const NFT_MANAGER = new ethers.Contract(nftAddress, AERO_NFT_MANAGER_ABI, signer);

    showLoading()
    NFT_MANAGER.collect(params)
      .then(function(t) {
        return App.provider.waitForTransaction(t.hash)
          .then(t => refresh(t.hash))
          .catch(err => transactionFailed(err));
      })
      .catch(function(err) {
        console.log(err)
        hideLoading()
      })
}

const cl_burn = async function(nftId, nftAddress, App) {
  const signer = App.provider.getSigner()

  const NFT_MANAGER = new ethers.Contract(nftAddress, AERO_NFT_MANAGER_ABI, signer);

    showLoading()
    NFT_MANAGER.burn(nftId)
      .then(function(t) {
        return App.provider.waitForTransaction(t.hash)
          .then(t => refresh(t.hash))
          .catch(err => transactionFailed(err));
      })
      .catch(function(err) {
        console.log(err)
        hideLoading()
      })
}

// DecreaseLiquidity
// struct DecreaseLiquidityParams {
//   uint256 tokenId;
//   uint128 liquidity;
//   uint256 amount0Min;
//   uint256 amount1Min;
//   uint256 deadline;
// }

// Collect
// struct CollectParams {
//   uint256 tokenId;
//   address recipient;
//   uint128 amount0Max;
//   uint128 amount1Max;
// }

// Burn
// tokenId