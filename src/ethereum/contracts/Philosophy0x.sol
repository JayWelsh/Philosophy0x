pragma solidity >=0.5.0 <0.6.0;

contract Philosophy0x {

    struct Philosophy {
        address account;
        string ipfsHash;
        uint score;
        uint timestamp;
    }

    Philosophy[] public philosophy;
    uint public philosophyCount;

    mapping (uint => address) public philosophyToPhilosopher;
    mapping (address => uint[]) private philosopherPhilosophyIds;
    mapping (uint => uint[]) private philosophyToRevisionList; //TODO
    
    function createPhilosophy(string memory _ipfsHash) public {
        uint id = philosophy.push(Philosophy(msg.sender, _ipfsHash, 0, now)) - 1;
        philosopherPhilosophyIds[msg.sender].push(id);
        philosophyToPhilosopher[id] = msg.sender;
        philosophyCount++;
    }

    function getPhilosopherPhilosophyIds(address _account) public view returns (uint[] memory) {
        return (philosopherPhilosophyIds[_account]);
    }
    
    function getPhilosophy(uint _philosophyId) public view returns(address, string memory, uint, uint) {
        return (philosophy[_philosophyId].account,
        philosophy[_philosophyId].ipfsHash,
        philosophy[_philosophyId].score,
        philosophy[_philosophyId].timestamp);
    }
    
}