pragma solidity >=0.5.0 <0.6.0;

contract Philosophy0x {

    struct Philosophy {
        address account;
        string ipfsHash;
        uint score;
        uint timestamp;
    }

    Philosophy[] public philosophy;
    Philosophy[] public philosophyRevisions;
    uint public philosophyCount;

    mapping (uint => address) public philosophyToPhilosopher;
    mapping (address => uint[]) public philosopherPhilosophyIds;
    mapping (uint => uint[]) public philosophyToRevisionList;
    
    function createPhilosophy(string memory _ipfsHash) public {
        uint id = philosophy.push(Philosophy(msg.sender, _ipfsHash, 0, now)) - 1; //Test contract - won't use now in production
        philosopherPhilosophyIds[msg.sender].push(id);
        philosophyToPhilosopher[id] = msg.sender;
        philosophyCount++;
    }

    function revisePhilosophy(string memory _ipfsHash, uint _id) public {
        if(philosophyToPhilosopher[_id] == msg.sender){
            uint revisionId = philosophyRevisions.push(Philosophy(msg.sender, _ipfsHash, 0, now)) - 1; //Test contract - won't use now in production
            philosophyToRevisionList[_id].push(revisionId);
        }
    }

    function getPhilosopherPhilosophyIds(address _account) public view returns (uint[] memory) {
        return (philosopherPhilosophyIds[_account]);
    }

    function getPhilosophyRevisionIds(uint _id) public view returns (uint[] memory) {
        return (philosophyToRevisionList[_id]);
    }
    
    function getPhilosophy(uint _philosophyId) public view returns(address, string memory, uint, uint) {
        return (philosophy[_philosophyId].account,
        philosophy[_philosophyId].ipfsHash,
        philosophy[_philosophyId].score,
        philosophy[_philosophyId].timestamp);
    }
    
}