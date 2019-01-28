import contract from 'truffle-contract';
import Philosophy0x from '../ethereum/build/contracts/Philosophy0x.json';
import Web3 from 'web3';

const web3 = window.ethereum ? window.ethereum : new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io:443'));

const Philosophy0xContract = contract(Philosophy0x);
Philosophy0xContract.setProvider(web3);

const getInstance = async () => {
  const instance = await Philosophy0xContract.deployed();
  return instance;
}

export const createPhilosophyHash = async (account, hash) => {
  const instance = await getInstance();
  const items = await instance.createPhilosophy(hash, { from: account });
  return items;
}

export const getPhilosopherPhilosophyIds = async (account) => {
  const instance = await getInstance();
  const items = await instance.getPhilosopherPhilosophyIds(account);
  return items;
}

export const getPhilosophyById = async (philosophyId) => {
  const instance = await getInstance();
  const items = await instance.getPhilosophy(philosophyId);
  return items;
}
