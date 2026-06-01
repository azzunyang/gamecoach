// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract GameCoachEscrow {
    enum State { IDLE, PENDING, ACCEPTED, ACTIVE, COMPLETED, REJECTED, CANCELLED, DISPUTED, RESOLVED }

    struct Lesson {
        address student;
        address coach;
        uint256 deposit;    // 30% paid upfront
        uint256 balance;    // 70% paid before session
        State   state;
    }

    mapping(bytes32 => Lesson) public lessons;

    event LessonRequested(bytes32 indexed id, address student, address coach, uint256 deposit);
    event LessonAccepted(bytes32 indexed id);
    event LessonRejected(bytes32 indexed id);
    event LessonCancelled(bytes32 indexed id);
    event BalancePaid(bytes32 indexed id);
    event LessonCompleted(bytes32 indexed id);
    event DisputeRaised(bytes32 indexed id);
    event DisputeResolved(bytes32 indexed id, address winner);

    address public admin;
    modifier onlyAdmin() { require(msg.sender == admin, "not admin"); _; }

    constructor() { admin = msg.sender; }

    function requestLesson(bytes32 id, address coach) external payable {
        require(lessons[id].state == State.IDLE, "exists");
        require(msg.value > 0, "deposit required");
        lessons[id] = Lesson(msg.sender, coach, msg.value, 0, State.PENDING);
        emit LessonRequested(id, msg.sender, coach, msg.value);
    }

    function acceptLesson(bytes32 id) external {
        Lesson storage l = lessons[id];
        require(msg.sender == l.coach, "not coach");
        require(l.state == State.PENDING, "wrong state");
        l.state = State.ACCEPTED;
        emit LessonAccepted(id);
    }

    function rejectLesson(bytes32 id) external {
        Lesson storage l = lessons[id];
        require(msg.sender == l.coach, "not coach");
        require(l.state == State.PENDING, "wrong state");
        l.state = State.REJECTED;
        uint256 refund = l.deposit;
        l.deposit = 0;
        payable(l.student).transfer(refund);
        emit LessonRejected(id);
    }

    function cancelLesson(bytes32 id) external {
        Lesson storage l = lessons[id];
        require(msg.sender == l.student, "not student");
        require(l.state == State.PENDING || l.state == State.ACCEPTED, "wrong state");
        l.state = State.CANCELLED;
        uint256 refund = l.deposit + l.balance;
        l.deposit = 0; l.balance = 0;
        payable(l.student).transfer(refund);
        emit LessonCancelled(id);
    }

    function payBalance(bytes32 id) external payable {
        Lesson storage l = lessons[id];
        require(msg.sender == l.student, "not student");
        require(l.state == State.ACCEPTED, "wrong state");
        require(msg.value > 0, "balance required");
        l.balance = msg.value;
        l.state = State.ACTIVE;
        emit BalancePaid(id);
    }

    function confirmCompletion(bytes32 id) external {
        Lesson storage l = lessons[id];
        require(msg.sender == l.student, "not student");
        require(l.state == State.ACTIVE, "wrong state");
        l.state = State.COMPLETED;
        uint256 payout = l.deposit + l.balance;
        l.deposit = 0; l.balance = 0;
        payable(l.coach).transfer(payout);
        emit LessonCompleted(id);
    }

    function requestDispute(bytes32 id) external {
        Lesson storage l = lessons[id];
        require(msg.sender == l.student || msg.sender == l.coach, "not party");
        require(l.state == State.ACTIVE, "wrong state");
        l.state = State.DISPUTED;
        emit DisputeRaised(id);
    }

    function resolveDispute(bytes32 id, address winner) external onlyAdmin {
        Lesson storage l = lessons[id];
        require(l.state == State.DISPUTED, "wrong state");
        require(winner == l.student || winner == l.coach, "invalid winner");
        l.state = State.RESOLVED;
        uint256 payout = l.deposit + l.balance;
        l.deposit = 0; l.balance = 0;
        payable(winner).transfer(payout);
        emit DisputeResolved(id, winner);
    }

    function withdraw() external {
        // coaches call this if needed (fallback); normally handled via confirmCompletion
        revert("use confirmCompletion");
    }
}
