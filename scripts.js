let userName = '';
let users = [];
let imposter = '';
let category = '';
let secretWord = '';
let turnOrder = [];
let currentTurnIndex = 0;
let roundCounter = 1;
let votes = {};
let isVotingPhase = false; // Indicates if voting phase is active

// List of categories and words
const categories = {
    Animals: ['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra'],
    Foods: ['Pizza', 'Burger', 'Sushi', 'Pasta', 'Tacos'],
    Countries: ['USA', 'Canada', 'Brazil', 'Australia', 'Japan']
};

function joinLobby() {
    const nameInput = document.getElementById('nameInput');
    userName = nameInput.value.trim();
    if (userName) {
        if (users.includes(userName)) {
            alert("You are already in the lobby.");
            return;
        }
        users.push(userName);
        updatePlayersList();

        // Show the Start Game button if there are at least 2 players
        if (users.length > 1) {
            document.getElementById('startButton').style.display = 'block';
        }
    }
}

function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = ''; // Clear the list

    const ul = document.createElement('ul');
    users.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        ul.appendChild(li);
    });
    playersList.appendChild(ul);

    updateVotingOptions();
}

function updateVotingOptions() {
    const voteSelect = document.getElementById('voteSelect');
    voteSelect.innerHTML = '<option value="">Vote for an Imposter or Skip</option>'; // Reset options

    users.forEach(player => {
        if (player !== userName) {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            voteSelect.appendChild(option);
        }
    });

    const skipOption = document.createElement('option');
    skipOption.value = 'skip';
    skipOption.textContent = 'Skip Round';
    voteSelect.appendChild(skipOption);
}

function startGame() {
    chooseImposter();
    chooseWord();
    randomizeTurnOrder();

    document.getElementById('lobby').style.display = 'none';
    document.getElementById('chatBox').style.display = 'block';
    document.getElementById('chatInput').style.display = 'flex';
    document.getElementById('votingBox').style.display = 'none'; // Hide voting box initially

    informPlayers();
    startNextTurn();
}

function chooseImposter() {
    const randomIndex = Math.floor(Math.random() * users.length);
    imposter = users[randomIndex];
    console.log(`The imposter is: ${imposter}`);
}

function chooseWord() {
    const categoryNames = Object.keys(categories);
    category = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const words = categories[category];
    secretWord = words[Math.floor(Math.random() * words.length)];
    console.log(`The chosen category is: ${category}`);
    console.log(`The secret word is: ${secretWord}`);
}

function randomizeTurnOrder() {
    turnOrder = [...users];
    for (let i = turnOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [turnOrder[i], turnOrder[j]] = [turnOrder[j], turnOrder[i]];
    }
    currentTurnIndex = 0;
}

function startNextTurn() {
    const chatContent = document.getElementById('chatContent');
    chatContent.innerHTML += `<p>It's ${turnOrder[currentTurnIndex]}'s turn.</p>`;
    document.getElementById('chatContent').scrollTop = chatContent.scrollHeight;

    if (turnOrder[currentTurnIndex] === userName) {
        // Disable voting during the turn phase
        document.getElementById('votingBox').style.display = 'none';
    }
}

function informPlayers() {
    users.forEach(user => {
        if (user === imposter) {
            informImposter(user);
        } else {
            informInvestigator(user);
        }
    });
}

function informImposter(user) {
    const chatContent = document.getElementById('chatContent');
    if (user === imposter) {
        const newMessage = document.createElement('p');
        newMessage.textContent = `Welcome ${user}! You are the Imposter. The category is: ${category}`;
        chatContent.appendChild(newMessage);
    }
}

function informInvestigator(user) {
    const chatContent = document.getElementById('chatContent');
    if (user !== imposter) {
        const newMessage = document.createElement('p');
        newMessage.textContent = `Welcome ${user}! You are an Investigator. The category is: ${category}. The secret word is: ${secretWord}`;
        chatContent.appendChild(newMessage);
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (message && userName) {
        const chatContent = document.getElementById('chatContent');
        const newMessage = document.createElement('p');
        newMessage.textContent = `${userName}: ${message}`;
        chatContent.appendChild(newMessage);
        messageInput.value = '';
        chatContent.scrollTop = chatContent.scrollHeight; // Scroll to the bottom
        
        // Check if the message sender is the current player
        if (userName === turnOrder[currentTurnIndex]) {
            // Move to the next turn
            currentTurnIndex = (currentTurnIndex + 1) % users.length;
            if (currentTurnIndex === 0) {
                endRound(); // End the round when all players have taken their turn
            } else {
                startNextTurn();
            }
        } else {
            alert("It's not your turn yet.");
        }
    }
}

function endRound() {
    isVotingPhase = true; // Set the voting phase to true
    document.getElementById('votingBox').style.display = 'block'; // Show voting box

    const chatContent = document.getElementById('chatContent');
    chatContent.innerHTML += `<p>The round has ended. Please vote for an imposter or skip the round.</p>`;
    chatContent.scrollTop = chatContent.scrollHeight;
}

function submitVote() {
    if (!isVotingPhase) {
        alert("Voting is not allowed at this time.");
        return;
    }

    const voteSelect = document.getElementById('voteSelect');
    const vote = voteSelect.value.trim();

    if (vote) {
        if (!votes[userName]) {
            votes[userName] = vote;

            if (Object.keys(votes).length === users.length) {
                processVotes();
            } else {
                const chatContent = document.getElementById('chatContent');
                const newMessage = document.createElement('p');
                newMessage.textContent = `${userName} voted for ${vote}`;
                chatContent.appendChild(newMessage);
                chatContent.scrollTop = chatContent.scrollHeight; // Scroll to the bottom
            }
        } else {
            alert("You have already voted.");
        }
    }
}

function processVotes() {
    const voteCounts = {};
    let skipVotes = 0;

    for (const vote of Object.values(votes)) {
        if (vote === 'skip') {
            skipVotes++;
        } else {
            if (!voteCounts[vote]) {
                voteCounts[vote] = 0;
            }
            voteCounts[vote]++;
        }
    }

    let maxVotes = 0;
    let mostVotedPlayer = null;

    for (const [player, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
            maxVotes = count;
            mostVotedPlayer = player;
        }
    }

    const chatContent = document.getElementById('chatContent');
    let resultMessage;

    if (skipVotes >= (users.length / 2)) {
        resultMessage = "The round was skipped.";
    } else if (mostVotedPlayer) {
        if (mostVotedPlayer === imposter) {
            resultMessage = `${mostVotedPlayer} was the Imposter! They have been eliminated.`;
        } else {
            resultMessage = `${mostVotedPlayer} was not the Imposter.`;
        }
    } else {
        resultMessage = "No valid votes were cast.";
    }

    chatContent.innerHTML += `<p>${resultMessage}</p>`;
    chatContent.scrollTop = chatContent.scrollHeight;

    // Prepare for the next round
    roundCounter++;
    document.getElementById('roundCounter').textContent = `Round: ${roundCounter}`;
    votes = {};
    isVotingPhase = false; // Reset voting phase

    // Reset game state for the next round
    chooseImposter();
    chooseWord();
    randomizeTurnOrder();
    startNextTurn();
}








