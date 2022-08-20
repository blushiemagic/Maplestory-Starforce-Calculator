'use strict';

const events = {
    none: 0,
    discount: 1,
    guarantee: 2,
    extra: 4,
    shining: 3
}

const mvp = {
    none: 1,
    silver: 0.97,
    gold: 0.95,
    diamond: 0.9
}

const destroyStar = 12;

const data = {
    0: { success: 0.95, drop: false },
    1: { success: 0.9, drop: false },
    2: { success: 0.85, drop: false },
    3: { success: 0.85, drop: false },
    4: { success: 0.8, drop: false },
    5: { success: 0.75, drop: false },
    6: { success: 0.7, drop: false },
    7: { success: 0.65, drop: false },
    8: { success: 0.6, drop: false },
    9: { success: 0.55, drop: false },
    10: { success: 0.5, drop: false },
    11: { success: 0.45, drop: true },
    12: { success: 0.4, drop: true, destroy: 0.01, safeguard: true },
    13: { success: 0.35, drop: true, destroy: 0.02, safeguard: true },
    14: { success: 0.3, drop: true, destroy: 0.02, safeguard: true },
    15: { success: 0.3, drop: false, destroy: 0.03, safeguard: true },
    16: { success: 0.3, drop: true, destroy: 0.03, safeguard: true },
    17: { success: 0.3, drop: true, destroy: 0.03, safeguard: false },
    18: { success: 0.3, drop: true, destroy: 0.04, safeguard: false },
    19: { success: 0.3, drop: true, destroy: 0.04, safeguard: false },
    20: { success: 0.3, drop: false, destroy: 0.1, safeguard: false },
    21: { success: 0.3, drop: true, destroy: 0.1, safeguard: false },
    22: { success: 0.03, drop: true, destroy: 0.2, safeguard: false },
    23: { success: 0.02, drop: true, destroy: 0.3, safeguard: false },
    24: { success: 0.01, drop: true, destroy: 0.4, safeguard: false }
};

function getPrice(args, star) {
    var level = Math.floor(args.level / 10) * 10;
    var base;
    if (star < 10) {
        base = Math.pow(level, 3) * (star + 1) / 2500;
    } else if (star < 15) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 40000;
    } else if (star < 18) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 12000;
    } else if (star < 20) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 11000;
    } else {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 10000;
    }
    base = Math.round(base) + 10;
    if (star >= 15) {
        base = Math.round(0.78 * base);
    }
    base *= 100;
    var multiplier = 1;
    if (star < 17) {
        multiplier = args.mvpDiscount;
    }
    if ((args.event & events.discount) > 0) {
        multiplier *= 0.7;
    }
    if (args.safeguard[star] && data[star].safeguard && canDestroy(args, star)) {
        multiplier += 1;
    }
    return base * multiplier;
}

function getSuccessRate(args, star) {
    var success = data[star].success;
    if (args.catcher) {
        success *= 1.05;
    }
    if ((args.event & events.guarantee) > 0 && (star === 5 || star === 10 || star === 15)) {
        success = 1;
    }
    return success;
}

function canDestroy(args, star) {
    var result = data[star].destroy && data[star].destroy > 0;
    if ((args.event & events.guarantee) > 0 && (star == 5 || star == 10 || star == 15)) {
        result = false;
    }
    if (args.eventSafeguard && star < 15) {
        result = false
    }
    return result;
}

function calculateRange(args, from, to, results) {
    var result = {
        price: 0,
        destroys: 0,
        noDestroyChance: 1
    };
    var skipEvent = (args.event & events.extra) > 0;
    for (var k = from; k < to; k++) {
        result.price += results[k].price;
        result.destroys += results[k].destroys;
        result.noDestroyChance *= results[k].noDestroyChance;
        if (skipEvent && k <= 10) {
            k++;
        }
    }
    return result;
}

function calculateStep(args, star, results) {
    var price = getPrice(args, star);
    var success = getSuccessRate(args, star);
    var skipEvent = (args.event & events.extra) > 0;
    var step = {};
    
    //special case: at 11 stars and 10 star success gives extra
    if (skipEvent && star === 11) {
        step.price = price + (1 - success) * results[star - 1].price;
        step.destroys = 0;
        step.noDestroyChance = 1;
        results[star] = step;
        return step;
    }

    //calculate cost of failure
    //given: already 1 failure
    var failureTable = [];
    var remainingRate = 1;
    var entry;
    if (canDestroy(args, star) && !(args.safeguard[star] && data[star].safeguard)) {
        //scenario: failure is a destroy
        entry = {
            weight: remainingRate * data[star].destroy,
            price: price,
            destroys: 1,
            noDestroyChance: 0
        };
        if (star > destroyStar) {
            var range = calculateRange(args, destroyStar, star, results);
            entry.price += range.price;
            entry.destroys += range.destroys;
        }
        failureTable.push(entry);
        remainingRate -= entry.weight;
    }
    if (data[star].drop) {
        //scenario: failure is a drop
        if (data[star - 1].drop) {
            //if (we can still drop more)
            //scenario: success immediately after failing
            var dropPrice = getPrice(args, star - 1);
            var dropSuccess = getSuccessRate(args, star - 1);
            entry = {
                weight: remainingRate * dropSuccess,
                price: dropPrice + price,
                destroys: 0,
                noDestroyChance: 1
            };
            failureTable.push(entry);
            remainingRate -= entry.weight;
            if (canDestroy(args, star - 1) && !(args.safeguard[star - 1] && data[star - 1].safeguard)) {
                //scenario: destroy right after failing
                entry = {
                    weight: remainingRate * data[star - 1].destroy,
                    price: dropPrice + price,
                    destroys: 1,
                    noDestroyChance: 0
                };
                if (star > destroyStar) {
                    var range = calculateRange(args, destroyStar, star, results);
                    entry.price += range.price;
                    entry.destroys += range.destroys;
                }
                failureTable.push(entry);
                remainingRate -= entry.weight;
            }
            //scenario: drop a second time and activate chance time
            if (skipEvent && star - 2 <= 10) {
                entry = {
                    weight: remainingRate,
                    price: getPrice(args, star - 2) + dropPrice + price,
                    destroys: 0,
                    noDestroyChance: 1
                };
            } else {
                entry = {
                    weight: remainingRate,
                    price: getPrice(args, star - 2) + dropPrice + price + results[star - 1].price,
                    destroys: results[star - 1].destroys,
                    noDestroyChance: results[star - 1].noDestroyChance
                };
            }
            failureTable.push(entry);
            remainingRate -= entry.weight;
        } else {
            //if (we can't drop anymore)
            entry = {
                weight: remainingRate,
                price: price + results[star - 1].price,
                destroys: results[star - 1].destroys,
                noDestroyChance: results[star - 1].noDestroyChance
            };
            failureTable.push(entry);
            remainingRate -= entry.weight;
        }
    } else {
        //scenario: failure is a keep
        entry = {
            weight: remainingRate,
            price: price,
            destroys: 0,
            noDestroyChance: 1
        };
        failureTable.push(entry);
        remainingRate -= entry.weight;
    }
    var failurePrice = 0;
    var failureDestroys = 0;
    var destroyChance = 0;
    for (var k = 0; k < failureTable.length; k++) {
        var entry = failureTable[k];
        failurePrice += entry.weight * entry.price;
        failureDestroys += entry.weight * entry.destroys;
        destroyChance += entry.weight * (1 - entry.noDestroyChance);
    }

    //calculate average cost
    var numFailures = (1 - success) / success;
    step.price = price + failurePrice * numFailures;
    step.destroys = failureDestroys * numFailures;
    //step.noDestroyChance = Math.pow(1 - destroyChance, numFailures);
    step.noDestroyChance = success / (success + destroyChance - success * destroyChance);

    results[star] = step;
    return step;
}

function calculate() {
    try {
        var args = {};
        args.event = events[document.getElementById('event').value];
        args.eventSafeguard = document.getElementById('event-safeguard').checked;
        args.mvpDiscount = mvp[document.getElementById('mvp').value];
        args.level = parseInt(document.getElementById('level').value);
        var from = parseInt(document.getElementById('from').value);
        var to = parseInt(document.getElementById('to').value);

        args.safeguard = {};
        for (var k = 0; k < 25; k++) {
            args.safeguard[k] = false;
        }
        if (document.getElementById('safeguard').checked) {
            var safeguardStars = document.getElementById('safeguard-stars').querySelectorAll('input');
            for (var k = 0; k < safeguardStars.length; k++) {
                if (safeguardStars[k].checked) {
                    args.safeguard[safeguardStars[k].id.split('-')[1]] = true;
                }
            }
        }

        args.catcher = document.getElementById('catcher').checked;
        var results = [];
        for (var k = 0; k < to; k++) {
            calculateStep(args, k, results);
        }
        var result = calculateRange(args, from, to, results);
        var resultDiv = document.getElementById('results');
        resultDiv.innerHTML = '';
        var div = document.createElement('div');
        div.innerHTML = 'Average Cost: ' + result.price.toLocaleString() + ' mesos';
        resultDiv.appendChild(div);
        div = document.createElement('div');
        div.innerHTML = 'Average Destroys: ' + result.destroys;
        resultDiv.appendChild(div);
        div = document.createElement('div');
        div.innerHTML = 'Chance of Destruction: ' + ((1 - result.noDestroyChance) * 100).toLocaleString() + '%';
        resultDiv.appendChild(div);
    } catch (e) {
        console.error(e);
    }
}

function toggleSafeguard() {
    var safeguard = document.getElementById('safeguard').checked;
    var checkboxes = document.getElementById('safeguard-stars').querySelectorAll('input');
    for (var k = 0; k < checkboxes.length; k++) {
        checkboxes[k].disabled = !safeguard;
    }
}
