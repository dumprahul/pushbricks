Push chain updated contract addresses:

(base) admin@192 contracts % forge create src/PushBricksToken.sol:PushBricksToken \
  --rpc-url push_testnet \
  --chain 42101 \
  --account mykey \
  --broadcast \
  --constructor-args 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b
[⠊] Compiling...
No files changed, compilation skipped
Enter keystore password:
Deployer: 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b
Deployed to: 0xf5595BdF1ed613e6996393FBbDf399D3552E4520
Transaction hash: 0x49e06d17ad523abee1c9e93d4fcf03a88930cd2c0dd33b7804d14eccb0b67f25



(base) admin@192 contracts % forge create src/PropertyNFT.sol:PropertyNFT \
  --rpc-url push_testnet \
  --chain 42101 \
  --account mykey \
  --broadcast \
  --constructor-args 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b
[⠊] Compiling...
No files changed, compilation skipped
Enter keystore password:
Deployer: 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b
Deployed to: 0x3125BB25506fbbb4466796533d908Eab1e132532
Transaction hash: 0x41700f1cd730e2338d2cce42d7dcd8a282cfa7359475119c041eb67ba8eb7b51


(base) admin@192 contracts % forge create src/PushBricksRegistry.sol:PushBricksRegistry \
  --rpc-url push_testnet \
  --chain 42101 \
  --account mykey \
  --broadcast \
  --constructor-args 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b 0x3125BB25506fbbb4466796533d908Eab1e132532
[⠊] Compiling...
No files changed, compilation skipped
Enter keystore password:
Deployer: 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b
Deployed to: 0x64D22254C797Fdf76486CCdb1163C956A8977aF0
Transaction hash: 0x900fe4a79d8e0dab12c09c4ee87799b4fa3ea747db3f20f8587e427365b5eadb


(base) admin@192 contracts % forge create src/PushBricksMarket.sol:PushBricksMarket \
  --rpc-url push_testnet \
  --chain 42101 \
  --account mykey \
  --broadcast \
  --constructor-args 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b 0x64D22254C797Fdf76486CCdb1163C956A8977aF0
[⠊] Compiling...
No files changed, compilation skipped
Enter keystore password:
Deployer: 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b
Deployed to: 0x3bDe719EcaCE07b8298CD3a4f892a1CDaA73E571
Transaction hash: 0x109efe19507ef2a708baa71d6ee12c4cae7af239b7326b7b4acb3fceb83e8514


(base) admin@192 contracts % forge create src/PropertyReviewSystem.sol:PropertyReviewSystem \
  --rpc-url push_testnet \
  --chain 42101 \
  --account mykey \
  --broadcast \
  --constructor-args 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b 0xf5595BdF1ed613e6996393FBbDf399D3552E4520 0x3125BB25506fbbb4466796533d908Eab1e132532
[⠊] Compiling...
No files changed, compilation skipped
Enter keystore password:
Deployer: 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b
Deployed to: 0x2Bfd0DfC06a22D598F406E5eC745b2FAaf566B3a
Transaction hash: 0xd1aac119e5e349aea5f5638b27b2e7c440bdcce134f5fef83729f73c786a2827



# Authorize Registry to mint properties
(base) admin@192 contracts % cast send 0x3125BB25506fbbb4466796533d908Eab1e132532 \
  "setRegistry(address,bool)" \
  0x64D22254C797Fdf76486CCdb1163C956A8977aF0 true \
  --rpc-url push_testnet \
  --chain 42101 \
  --account mykey
Enter keystore password:

blockHash            0x8d53eef152046ac76f68ca747ebfa5f6ed909b9bd9ac68e8ae43b3c752860f53
blockNumber          1916963
contractAddress      
cumulativeGasUsed    46780
effectiveGasPrice    1000000001
from                 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b
gasUsed              46780
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x0d04bae17415a515b9d89acd5c475d912d92d5b94706894841ac9920e4eff011
transactionIndex     0
type                 2
blobGasPrice         
blobGasUsed          
to                   0x3125BB25506fbbb4466796533d908Eab1e132532


# Authorize Market to transfer NFTs  
(base) admin@192 contracts % cast send 0x3125BB25506fbbb4466796533d908Eab1e132532 \
  "setMarket(address,bool)" \
  0x3bDe719EcaCE07b8298CD3a4f892a1CDaA73E571 true \
  --rpc-url push_testnet \
  --chain 42101 \
  --account mykey
Enter keystore password:

blockHash            0xe9bdbb651f04f2d3cac06dabef7a20d4f44c318132a203e42a08589f60acc32b
blockNumber          1917057
contractAddress      
cumulativeGasUsed    46825
effectiveGasPrice    1000000001
from                 0x94457d9a4a88eF1a9986fe05Fd496fF95e255b4b
gasUsed              46825
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x29dcf47e6be579c46c086cfbfd2983f9f9d70c6ad6466e83c3225bbc51d79548
transactionIndex     0
type                 2
blobGasPrice         
blobGasUsed          
to                   0x3125BB25506fbbb4466796533d908Eab1e132532


