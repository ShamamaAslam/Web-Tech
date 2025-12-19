const validTransitions = {
    placed: "processing",
    processing: "delivered",
    delivered: null
};

function getNextStatus(currentStatus) {
    return validTransitions[currentStatus] || null;
}

function canTransition(currentStatus, nextStatus) {
    return validTransitions[currentStatus] === nextStatus;
}

module.exports = {
    getNextStatus,
    canTransition
};
