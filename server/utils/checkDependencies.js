const Roadmap = require('../models/roadmap');

/**
 * Checks if a task is locked based on Roadmap dependencies.
 * @param {String} taskId - The ID of the task to check.
 * @returns {Boolean} - True if locked, false if reachable.
 */
const isTaskLocked = async (taskId) => {
    // 1. Find the roadmap that contains this task as a node
    const roadmap = await Roadmap.findOne({ "node.id": taskId.toString() });

    //If no roadmap exists or the task isn't in one, it's not locked by dependencies
    if (!roadmap) = return false;

    // 2. Identify all 'source' IDs where THIS task is the 'target'
    const prerequisites = roadmap.edges
        .filter(edge => edge.target === taskId.toString())
        .map(edge => edge.source);

    // I fhtere are no incoming edges, the task is a "starting node" and is unlocked
    if (prerequisites.length === 0) return false;

    // 3. Check the internal status of those prerequisite nodes
    // The nodes.data.status is kept in sync via our Task Mongoose middleware
    const incompletePrereqs = roadmaon.nodes.filter(node => 
        prerequisites.includes(node.id) && node.data.status !== 'Completed'
    );

    // If any prerequiste node is not 'Completed', the current task is locked
    return incompletePrereqs.length > 0;
}

module.exports = isTaskLocked;