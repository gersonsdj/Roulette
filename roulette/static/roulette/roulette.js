CHIP_IMAGE = "https://cdn-icons-png.flaticon.com/512/1036/1036781.png";

let hovering = false; // To know if the hover is active
//load from django into dictionary
var positions = {};
var table_nums = {};
var methods = {};
var editing = null;
var testing = true; // to know if the page is in test mode

document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('#save-strategy')) {
        testing = false;
        //load_methods_from_be(load_select_method);
        load_positions_from_be(give_reasons_to_work);
        document.querySelector('#save-strategy').addEventListener('click', save_strategy);
        document.querySelector('#reset-strategy').addEventListener('click', reset);

        if (document.querySelector('#strategies-view') !== null) {
            get_strategies();
        }
    }
});

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}


function get_strategies() {
    // show all strategies from the user
    reset()
    fetch('/strategies', {
            method: 'GET'
        })
        .then(handleErrors)
        .then(response => response.json())
        .then(strategies => {
            const view = document.querySelector('#strategies-view');
            remove_all_children(view);
            const card_title = document.createElement('h4');
            card_title.classList.add('card-title');
            card_title.innerHTML = "<br>My Strategies:";
            view.append(card_title);
            strategies.forEach(strategy => {
                view.append(create_strategy_view(strategy));
            });
        }).catch(error => {
            console.log(error)
        });
}

function remove_all_children(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function create_strategy_view(strategy) {
    const card = document.createElement('div');
    card.classList.add('card', 'border-danger', 'text-dark', 'mb-2');

    const card_body = document.createElement('div');
    card_body.classList.add('card-body');
    card.append(card_body);

    // Name (Card title)
    const card_title = document.createElement('h5');
    card_title.classList.add('card-title');
    card_title.innerHTML = `${strategy.id} ${strategy.name}`;
    card_body.append(card_title);

    // Bets
    const card_text = document.createElement('div');
    card_text.classList.add('card-text');
    const bets_body = document.createElement('div');
    bets_body.innerHTML = `<b>Bets:</b>${strategy.bets}`;

    // if (strategy.is_from_user) { when we have shared strategies
    // edit button
    const edit = document.createElement('a');
    edit.href = '#!';
    edit.innerHTML = 'Edit';
    card_text.append(edit);
    edit.addEventListener('click', () => edit_strategy(strategy))

    // delete button
    const del = document.createElement('a');
    del.href = '#!';
    del.innerHTML = 'Delete';
    del.style.margin = '5px';
    card_text.append(del);
    del.addEventListener('click', () => delete_strategy(strategy))
        // }

    card_text.append(bets_body);

    // Testing button  - FUTURE 
    // const test = document.createElement('button');
    // test.classList.add('btn', 'btn-success');
    // test.onclick = () => window.location = `testing/${strategy.id}`;
    // test.innerHTML = `${strategy.tests} test(s)`;
    // card_text.append(test);

    card_body.append(card_text);

    return card;
}

function save_strategy() {
    const name = document.querySelector('#name').value.trim();
    const error_msg = document.querySelector('#error-message');
    error_msg.innerHTML = "";

    // ----- Validations -----
    // check if name is filled in
    if (name === "") {
        error_msg.innerHTML = "You must give it a name.";
    }

    // checks whether there is some bet > 0
    const bet = (key) => positions[key].bet > 0;
    if (!Object.keys(positions).some(bet)) {
        error_msg.innerHTML += " You must place at least one bet.";
    }

    if (error_msg.innerHTML != "") {
        return;
    }

    // Save it!
    fetch('/strategy', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                positions: positions,
                id: editing
            })
        })
        .then(handleErrors)
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            get_strategies();
        }).catch(error => {
            error_msg.innerHTML = error;
        });
}

function delete_strategy(strategy) {

    if (!confirm(`Are you sure you wanna delete strategy named '${strategy.name}'?`))
        return;

    const error_msg = document.querySelector('#error-message');
    error_msg.innerHTML = "";
    // Delete it!
    fetch('/strategy', {
            method: 'DELETE',
            body: JSON.stringify({
                name: '',
                positions: '',
                id: strategy.id
            })
        })
        .then(handleErrors)
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            get_strategies();
        }).catch(error => {
            error_msg.innerHTML = error;
        });
}

function edit_strategy(strategy) {

    // check for bets in progress and ask if user wants to cancel        
    if (it_contains_bets() && !confirm("You already have bets opened. Do you want to proceed?")) {
        return;
    }

    // reset first
    reset();
    document.querySelector('#mode').innerHTML = "Editing Strategy:";
    document.querySelector('#name').value = strategy.name;

    editing = strategy.id;
    strategy.positions.forEach(pos => {
        change_bet(pos.name, 1);
    });
    update_bets();
}

/* Calculation functions */

function load_positions_from_be(callback) {
    fetch('/positions', { method: 'GET' })
        .then(response => response.json())
        .then(result => {
            result.forEach(pos => {
                positions[pos.name] = pos;
            });
        })
        .then(callback);
}

function give_reasons_to_work() {

    // Button actions
    const ctrl_buttons = document.querySelectorAll('.controlls .btn');
    const num_buttons = document.querySelectorAll('.num');

    ctrl_buttons.forEach(item => {
        const pos = item.dataset.position;
        const rect = item.getBoundingClientRect();
        positions[pos].left = Math.round(rect.left + rect.width / 2) - 10;
        positions[pos].top = Math.round(rect.top + rect.height / 2) - 10;
        // Add listeners
        item.addEventListener('mouseover', () => hover(item, true), false);
        item.addEventListener('mouseout', () => hover(item, false), false);
        item.addEventListener('mousedown', event => mouse_down(item, event), false);
    });

    num_buttons.forEach(item => {
        const num = Number(item.dataset.number);
        table_nums[num] = item; // TODO: Nao sei pra que, talvez nao precise
    });

    function hover(obj, _hovering) {
        const pos = obj.dataset.position;
        const win_nums = positions[pos].winning_numbers.split(',');
        hovering = _hovering;
        if (hovering) {
            win_nums.forEach(num => {
                table_nums[num].classList.add('hover');
            })
        } else {
            win_nums.forEach(num => {
                table_nums[num].classList.remove('hover');
            })
        }
    }

    function mouse_down(obj, e) {
        const multiplier = (e.button == 2) ? -1 : 1; // right-click sets to negative
        change_bet(obj.dataset.position, multiplier);
    }

    document.oncontextmenu = () => { return !hovering };
}


function random_int() {
    return Math.floor(Math.random() * 4) - 5;
}

var chips = new Array(48);

function add_chip(id) {
    var img = document.createElement('img');
    img.src = CHIP_IMAGE;
    img.style.zIndex = "0";
    img.style.position = "absolute";
    img.style.left = (positions[id].left + random_int()) + "px";
    img.style.top = (positions[id].top + random_int()) + "px";

    img.style.width = "20px";
    img.style.pointerEvents = "none";

    document.body.appendChild(img);

    if (chips[id] == null)
        chips[id] = new Array(0);
    chips[id].push(img);
}

function remove_chip(id) {
    if (chips[id] != null && chips[id].length > 0)
        document.body.removeChild(chips[id].pop());
}

function change_bet(id, amount) {
    if (amount > 0)
        add_chip(id);
    else
        remove_chip(id);

    positions[id].bet += amount;

    if (positions[id].bet < 0) {
        positions[id].bet = 0;
    }
    update_bets();
    //UpdateBets();
    // UpdateBalance();
}

function reset() {

    document.querySelector('#name').value = "";
    document.querySelector('#mode').innerHTML = "New Strategy:";
    Object.keys(positions).forEach(function(key) {
        change_bet(positions[key].name, -1);
    });

    balance = 1;
    editing = null;
    update_bets();
    document.querySelector('#error-message').innerHTML = "";
}

function it_contains_bets() {

    let result = false;
    Object.keys(positions).forEach(function(key) {
        if (positions[key].bet > 0)
            result = true;
    });

    return result;
}

function update_bets() {
    var betdiv = document.getElementById("bets");
    betdiv.innerHTML = '';
    Object.keys(positions).forEach(function(key) {
        if (positions[key].bet > 0) {
            betdiv.innerHTML += '[' + key + '] : $' + positions[key].bet + "<br>";
        }
    });
    // for (var i = 37; i < bets.length; i++)if (bets[i] > 0) betdiv.innerHTML += sectors[i - 37] + ": " + (bets[i] * CurrentTier).toFixed(2) + "<br>";
    // for (var i = 0; i < 37; i++)if (bets[i] > 0) betdiv.innerHTML += "Number " + i + ": " + (bets[i] * CurrentTier).toFixed(2) + "<br>";
}



/*

function TotalBets() {
    var r = 0;
    for (var i = 0; i < bets.length; i++)r += bets[i];
    return r;
}


function UpdateBalance() {
    var e = document.getElementById("balance");
    e.innerHTML = "Balance: " + balance.toFixed(2) + " ETH";
    var tb = TotalBets();
    if (tb > 0) e.innerHTML += " (" + (tb * CurrentTier).toFixed(2) + ")";
}

function Place() {
    var bet = 0;
    for (var i = 0; i < bets.length; i++)if (bets[i] != 0) bet += bets[i];
    bet *= CurrentTier;

    if (bet > balance) {
        var betdiv = document.getElementById("result");
        betdiv.innerHTML = "Insufficient balance!";
        return;
    }

    var result = Math.floor(Math.random() * 37);

    var win = 0;
    if (bets[result] != 0) win += bets[result] * 36;
    for (var i = 37; i < bets.length; i++)if (bets[i] != 0) win += bets[i] * sectormultipliers[i - 37][result];

    win *= CurrentTier;
    win -= bet;

    console.log("BET: " + bet + " WIN: " + win);

    var betdiv = document.getElementById("result");
    if (win >= bet) betdiv.innerHTML = "Lucky number: " + result + " you won " + win.toFixed(2) + " ETH!";
    else betdiv.innerHTML = "Lucky number: " + result + " you lost " + win.toFixed(2) + " ETH!";

    balance += win;
    UpdateBalance();
}

var balance = 1;

var CurrentTier = 0.01;

var tiers = [
    0.0001,
    0.0002,
    0.001,
    0.002,
    0.01,
    0.02
];

var sectors = [
    "3rd column",
    "2nd column",
    "1st column",
    "1st 12",
    "2nd 12",
    "3rd 12",
    "1 to 18",
    "Even",
    "Red",
    "Black",
    "Odd",
    "19 to 36"
];

var hovering = 0;
var bets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var sectormultipliers = [
    [0, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3],//3rd column
    [0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0],//2nd column
    [0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0],//1st column
    [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//1st 12
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//2nd 12
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],//3rd 12
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],//1 to 18
    [0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2],//even
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0, 2, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0, 2],//Red
    [0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 2, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 2, 0, 2, 0, 2, 0, 2, 0],//Black
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],//odd
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] //19 to 36
];
*/