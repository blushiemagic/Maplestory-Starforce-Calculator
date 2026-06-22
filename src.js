'use strict';

const events = {
    none: 0,
    discount: 1,
    guarantee: 2,
    extra: 4,
    lowerDestroy: 8,
    shining: 9,
    shining2: 11
};

const mvp = {
    none: 1,
    silver: 0.97,
    gold: 0.95,
    diamond: 0.9
};

const data = {
    0: { success: 0.95 },
    1: { success: 0.9 },
    2: { success: 0.85 },
    3: { success: 0.85 },
    4: { success: 0.8 },
    5: { success: 0.75 },
    6: { success: 0.7 },
    7: { success: 0.65 },
    8: { success: 0.6 },
    9: { success: 0.55 },
    10: { success: 0.5 },
    11: { success: 0.45 },
    12: { success: 0.4 },
    13: { success: 0.35 },
    14: { success: 0.3 },
    15: { success: 0.3, destroy: 0.03, destroyStar: 12, safeguard: true, modes: {
        2: { success: 0.3, destroy: 0.02, cost: 1.5 },
        3: { success: 0.3, destroy: 0.01, cost: 2.5 },
        4: { success: 0.3, destroy: 0, cost: 3 }
    }},
    16: { success: 0.3, destroy: 0.03, destroyStar: 12, safeguard: true, modes: {
        2: { success: 0.3, destroy: 0.02, cost: 1.5 },
        3: { success: 0.3, destroy: 0.01, cost: 2.5 },
        4: { success: 0.3, destroy: 0, cost: 3 }
    }},
    17: { success: 0.15, destroy: 0.08, destroyStar: 12, safeguard: true, modes: {
        2: { success: 0.15, destroy: 0.05, cost: 1.5 },
        3: { success: 0.15, destroy: 0.02, cost: 2.5 },
        4: { success: 0.15, destroy: 0, cost: 3 }
    }},
    18: { success: 0.15, destroy: 0.08, destroyStar: 12, safeguard: false, modes: {
        2: { success: 0.12, destroy: 0.05, cost: 2 },
        3: { success: 0.1, destroy: 0.02, cost: 3.5 },
        4: { success: 0.08, destroy: 0, cost: 6.5 }
    }},
    19: { success: 0.15, destroy: 0.1, destroyStar: 12, safeguard: false, modes: {
        2: { success: 0.12, destroy: 0.07, cost: 2 },
        3: { success: 0.1, destroy: 0.04, cost: 3.5 },
        4: { success: 0.08, destroy: 0, cost: 6.5 }
    } },
    20: { success: 0.3, destroy: 0.15, destroyStar: 15, safeguard: false, modes: {
        2: { success: 0.25, destroy: 0.1, cost: 2 },
        3: { success: 0.2, destroy: 0.05, cost: 3.5 },
        4: { success: 0.15, destroy: 0, cost: 6.5 }
    }},
    21: { success: 0.15, destroy: 0.15, destroyStar: 17, safeguard: false, modes: {
        2: { success: 0.12, destroy: 0.1, cost: 2 },
        3: { success: 0.1, destroy: 0.05, cost: 3.5 },
        4: { success: 0.08, destroy: 0, cost: 6.5 }
    }},
    22: { success: 0.15, destroy: 0.2, destroyStar: 17, safeguard: false, modes: false },
    23: { success: 0.1, destroy: 0.2, destroyStar: 19, safeguard: false, modes: false },
    24: { success: 0.1, destroy: 0.2, destroyStar: 19, safeguard: false, modes: false },
    25: { success: 0.1, destroy: 0.2, destroyStar: 19, safeguard: false, modes: false },
    26: { success: 0.07, destroy: 0.2, destroyStar: 20, safeguard: false, modes: false },
    27: { success: 0.05, destroy: 0.2, destroyStar: 20, safeguard: false, modes: false },
    28: { success: 0.03, destroy: 0.2, destroyStar: 20, safeguard: false, modes: false },
    29: { success: 0.01, destroy: 0.2, destroyStar: 20, safeguard: false, modes: false }
};

class Matrix {
    #rows;
    #columns;
    #rowContents;

    constructor(rows) {
        if (!rows) {
            throw Error('No rows provided');
        }
        if (!rows.length) {
            throw Error('Empty rows provided');
        }
        if (!rows[0].length) {
            throw Error('Empty row at index 0');
        }
        this.#rows = rows.length;
        this.#columns = rows[0].length;
        this.#rowContents = new Array(rows.length);
        for (var k = 0; k < this.#rows; k++) {
            if (rows[k].length != this.#columns) {
                throw Error('Rows have different sizes');
            }
            this.#rowContents[k] = [...rows[k]];
        }
    }

    get rows() {
        return this.#rows;
    }

    get columns() {
        return this.#columns;
    }

    get(row, column) {
        return this.#rowContents[row][column];
    }

    copyContents() {
        return this.#rowContents.map(row => [...row]);
    }

    toString() {
        return this.#rowContents.map(row => row.toString()).join(',\n');
    }

    static newColumn(column) {
        return new Matrix(column.map(entry => [entry]));
    }

    static identity(size) {
        var rowContents = new Array(size);
        for (var k = 0; k < size; k++) {
            rowContents[k] = new Array(size).fill(0);
            rowContents[k][k] = 1;
        }
        return new Matrix(rowContents);
    }

    static ones(rows, columns) {
        return new Matrix(new Array(rows).fill(new Array(columns).fill(1)));
    }

    static mult(matrix1, matrix2) {
        if (matrix1.columns != matrix2.rows) {
            throw Error('Matrix 1 columns != Matrix 2 rows');
        }
        var rowContents = new Array(matrix1.rows);
        for (var r = 0; r < matrix1.rows; r++) {
            rowContents[r] = new Array(matrix2.columns);
            for (var c = 0; c < matrix2.columns; c++) {
                rowContents[r][c] = 0;
                for (var k = 0; k < matrix1.columns; k++) {
                    rowContents[r][c] += matrix1.get(r, k) * matrix2.get(k, c);
                }
            }
        }
        return new Matrix(rowContents);
    }
}

function getEnhancementMode(args, star) {
    if (data[star].modes && canDestroy(args, star)) {
        return data[star].modes[args.modes[star]] ?? null;
    } else {
        return null;
    }
}

function getPrice(args, star) {
    var level = Math.floor(args.level / 10) * 10;
    var base;
    if (star < 10) {
        base = Math.pow(level, 3) * (star + 1) / 2500;
    } else if (star === 10) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 40000;
    } else if (star === 11) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 22000;
    } else if (star === 12) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 15000;
    } else if (star === 13) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 11000;
    } else if (star === 14) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 7500;
    } else if (star === 15 || star === 16 || star === 20 || star >= 22) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 20000;
    } else if (star === 17) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 15000;
    } else if (star === 18) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 7000;
    } else if (star === 19) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 4500;
    } else if (star === 21) {
        base = Math.pow(level, 3) * Math.pow(star + 1, 2.7) / 12500;
    }
    base = Math.round(base) + 10;
    base *= 100;
    var multiplier = 1;
    if (star < 17) {
        multiplier = args.mvpDiscount;
    }
    if ((args.event & events.discount) > 0) {
        multiplier *= 0.7;
    }
    var mode = getEnhancementMode(args, star);
    if (mode) {
        if (data[star].safeguard && mode.destroy <= 0) {
            multiplier += mode.cost - 1;
        } else {
            multiplier *= mode.cost;
        }
    }
    return base * multiplier;
}

function getSuccessRate(args, star) {
    var success = data[star].success;
    var mode = getEnhancementMode(args, star);
    if (mode) {
        success = mode.success;
    }
    if (args.catcher) {
        success *= 1.05;
    }
    if ((args.event & events.guarantee) > 0 && (star === 5 || star === 10 || star === 15)) {
        success = 1;
    }
    return success;
}

function canDestroy(args, star) {
    if ((args.event & events.guarantee) > 0 && (star == 5 || star == 10 || star == 15)) {
        return false;
    }
    return data[star].destroy && data[star].destroy > 0;
}

function getDestroyRate(args, star) {
    if (!canDestroy(args, star)) {
        return 0;
    }
    var rate = data[star].destroy;
    var mode = getEnhancementMode(args, star);
    if (mode) {
        rate = mode.destroy;
    }
    if ((args.event & events.lowerDestroy) > 0 && star < 22) {
        rate *= 0.7;
    }
    return rate;
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
    var failureTable = [];
    var remainingRate = 1;
    var entry;
    var destroyRate = getDestroyRate(args, star);
    if (canDestroy(args, star) && destroyRate > 0) {
        //scenario: failure is a destroy
        entry = {
            weight: remainingRate * getDestroyRate(args, star),
            price: price,
            destroys: 1,
            noDestroyChance: 0
        };
        if (star > data[star].destroyStar) {
            var range = calculateRange(args, data[star].destroyStar, star, results);
            entry.price += range.price;
            entry.destroys += range.destroys;
        }
        failureTable.push(entry);
        remainingRate -= entry.weight;
    }

    //scenario: failure is a keep
    entry = {
        weight: remainingRate,
        price: price,
        destroys: 0,
        noDestroyChance: 1
    };
    failureTable.push(entry);
    remainingRate -= entry.weight;

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
        var resultDiv = document.getElementById('results');
        resultDiv.hidden = true;
        document.getElementById('destroy-details').hidden = true;

        var args = {};
        args.event = events[document.getElementById('event').value];
        args.mvpDiscount = mvp[document.getElementById('mvp').value];
        args.level = parseInt(document.getElementById('level').value);
        var from = parseInt(document.getElementById('from').value);
        var to = parseInt(document.getElementById('to').value);

        args.modes = {};
        for (var k = 0; k < 30; k++) {
            args.modes[k] = 1;
        }
        var starModes = document.getElementById('star-modes').querySelectorAll('input');
        for (var k = 0; k < starModes.length; k++) {
            var star = parseInt(starModes[k].id.split('-')[0]);
            args.modes[star] = starModes[k].value;
        }

        args.catcher = document.getElementById('catcher').checked;

        // Calculate main results

        var results = [];
        for (var k = 0; k < to; k++) {
            calculateStep(args, k, results);
        }
        var result = calculateRange(args, from, to, results);

        document.getElementById('cost-average').innerHTML = result.price.toLocaleString();
        document.getElementById('destroy-average').innerHTML = result.destroys;
        resultDiv.hidden = false;

        // Calculate destroy percents
        if (result.noDestroyChance < 1) {
            var lowestStar = from;
            for (var star in data) {
                if (getDestroyRate(args, star) > 0 && data[star].destroyStar < lowestStar) {
                    lowestStar = data[star].destroyStar;
                }
            }

            var resultFromTo = {};
            for (var calcFrom = lowestStar; calcFrom < to; calcFrom++) {
                resultFromTo[calcFrom] = {};
                for (var calcTo = calcFrom + 1; calcTo <= to; calcTo++) {
                    resultFromTo[calcFrom][calcTo] = calculateRange(args, calcFrom, calcTo, results);
                }
            }

            var destroyStars = [];
            for (var k = lowestStar; k < to; k++) {
                if (getDestroyRate(args, k) > 0 && !destroyStars.includes(data[k].destroyStar)) {
                    destroyStars.push(data[k].destroyStar);
                }
            }

            var matrixContents = new Array(destroyStars.length);
            for (var r = 0; r < destroyStars.length; r++) {
                matrixContents[r] = new Array(destroyStars.length);
                var calcFrom = destroyStars[r];
                for (var c = 0; c < destroyStars.length; c++) {
                    matrixContents[r][c] = 0;
                    for (var k = calcFrom; k < to; k++) {
                        if (getDestroyRate(args, k) > 0 && data[k].destroyStar == destroyStars[c]) {
                            var successRate = getSuccessRate(args, k);
                            var destroyChance = (1 - successRate) * getDestroyRate(args, k);
                            destroyChance = destroyChance / (successRate + destroyChance);
                            var starChance = calcFrom == k ? 1 : resultFromTo[calcFrom][k].noDestroyChance;
                            matrixContents[r][c] += starChance * destroyChance;
                        }
                    }
                }
            }
            var destroyDistribution = new Matrix(matrixContents);

            matrixContents = [new Array(destroyStars.length).fill(0)];
            for (var k = from; k < to; k++) {
                if (getDestroyRate(args, k) > 0) {
                    var successRate = getSuccessRate(args, k);
                    var destroyChance = (1 - successRate) * getDestroyRate(args, k);
                    destroyChance = destroyChance / (successRate + destroyChance);
                    var starChance = from == k ? 1 : resultFromTo[from][k].noDestroyChance;
                    var destroyIndex = destroyStars.indexOf(data[k].destroyStar);
                    matrixContents[0][destroyIndex] += starChance * destroyChance;
                }
            }
            var firstDistribution = new Matrix(matrixContents);

            var numDestroyDistributions = new Map();
            numDestroyDistributions.set(0, Matrix.identity(destroyStars.length));
            numDestroyDistributions.set(1, destroyDistribution);
            function getPercentile(destroyCount) {
                var distribution = Matrix.mult(firstDistribution, numDestroyDistributions.get(destroyCount));
                return 1 - Matrix.mult(distribution, Matrix.ones(destroyStars.length, 1)).get(0, 0);
            }
            // binary search time
            var last = 1;
            var count = 0;
            var increment = 1;
            const percentiles = [0.25, 0.5, 0.75, 0.95];
            var percentileDestroys = [0, 0, 0, 0];
            for (var k = 0; k < percentiles.length; k++) {
                if (count == 0 && getPercentile(0) >= percentiles[k]) {
                    percentileDestroys[k] = 0;
                } else if (last == 1 && getPercentile(1) >= percentiles[k]) {
                    percentileDestroys[k] = 1;
                } else {
                    count = last;
                    var currentPercentile = getPercentile(count);
                    while (currentPercentile < percentiles[k]) {
                        var distribution = numDestroyDistributions.get(count);
                        count *= 2;
                        last = count;
                        numDestroyDistributions.set(count, Matrix.mult(distribution, distribution));
                        currentPercentile = getPercentile(count);
                    }
                    increment = count / 2;
                    while (increment > 1) {
                        increment /= 2;
                        if (currentPercentile >= percentiles[k]) {
                            count -= 2 * increment;
                        }
                        if (!numDestroyDistributions.has(count + increment)) {
                            var countDistribution = numDestroyDistributions.get(count);
                            var incrementDistribution = numDestroyDistributions.get(increment);
                            numDestroyDistributions.set(count + increment, Matrix.mult(countDistribution, incrementDistribution));
                        }
                        count += increment;
                        currentPercentile = getPercentile(count);
                    }
                    if (currentPercentile < percentiles[k]) {
                        percentileDestroys[k] = count + 1;
                    } else {
                        percentileDestroys[k] = count;
                    }
                }
            }

            document.getElementById('destroy-chance').innerHTML = ((1 - result.noDestroyChance) * 100).toLocaleString();
            for (var k = 0; k < percentiles.length; k++) {
                document.getElementById('destroy-percent-' + (100 * percentiles[k])).innerHTML = percentileDestroys[k];
            }
            var canvas = document.getElementById('destroy-graph');
            drawDestroyGraph(canvas, firstDistribution, destroyDistribution);
            document.getElementById('destroy-details').hidden = false;
        }
    } catch (e) {
        console.error(e);
    }
}

function drawDestroyGraph(canvas, firstDistribution, destroyDistribution) {
    const numSamples = 10;
    var ones = Matrix.ones(firstDistribution.columns, 1);
    var moreDestroyChance = Matrix.mult(firstDistribution, ones);
    var destroyChances = [ 1 - moreDestroyChance.get(0, 0) ];
    var distribution = firstDistribution;
    for (var k = 0; k < numSamples; k++) {
        distribution = Matrix.mult(distribution, destroyDistribution);
        destroyChances.push(1 - Matrix.mult(distribution, ones).get(0, 0));
    }

    var context = canvas.getContext('2d');
    context.reset();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineCap = 'square';
    context.font = '12px sans-serif';
    const topPadding = 40;
    const padding = 60;
    context.beginPath();
    context.moveTo(padding + 0.5, topPadding + 0.5);
    context.lineTo(padding + 0.5, canvas.height - padding - 0.5);
    context.lineTo(canvas.width - 0.5, canvas.height - padding - 0.5);
    context.stroke();

    var percents = [ 0.25, 0.5, 0.75, 0.95 ];
    context.fillStyle = 'black';
    context.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    for (var percent of percents) {
        var height = (canvas.height - topPadding - padding) * (1 - percent);
        height = topPadding + Math.floor(height) + 0.5;
        context.beginPath();
        context.moveTo(padding + 0.5, height);
        context.lineTo(canvas.width - 0.5, height);
        context.stroke();
        var text = (100 * percent) + '%';
        var textWidth = context.measureText(text).width;
        context.fillText(text, padding - 4 - textWidth, height + 5);
    }
    context.beginPath();
    context.moveTo(padding + 0.5, topPadding + 0.5);
    context.lineTo(canvas.width - 0.5, topPadding + 0.5);
    context.stroke();

    for (var k = 0; k <= numSamples; k++) {
        var gradient = context.createLinearGradient(0, 0, topPadding, canvas.height - padding);
        var r = Math.floor(k * 255 / 2 / numSamples);
        var b = 255 - Math.floor(k * 255 / 2 / numSamples);
        gradient.addColorStop(0, `rgb(${1.5 * r}, ${b}, ${b})`);
        gradient.addColorStop(1, `rgb(${r}, 0, ${b})`);
        context.fillStyle = gradient;
        var barHeight = destroyChances[k] * (canvas.height - topPadding - padding);
        context.fillRect(padding + 16 + 32 * k, canvas.height - padding - barHeight, 24, barHeight);
        context.fillStyle = 'black';
        var textWidth = context.measureText(k).width;
        context.fillText(k, padding + 16 + 32 * k + (24 - textWidth) / 2, canvas.height - padding + 16);
    }

    context.font = 'bold 24px sans-serif';
    context.fillStyle = 'black';
    var text = 'Chance of X or Fewer Destroys';
    var textWidth = context.measureText(text).width;
    context.fillText(text, (canvas.width - textWidth) / 2, 30);
    text = 'Destroys';
    textWidth = context.measureText(text).width;
    context.fillText(text, (padding + canvas.width - textWidth) / 2, canvas.height - 10);
    text = 'Percentile';
    context.font = 'bold 16px sans-serif';
    var y = topPadding + (canvas.height - topPadding - padding - 16 * text.length) / 2;
    for (var k = 0; k < text.length; k++) {
        textWidth = context.measureText(text[k]).width;
        context.fillText(text[k], padding / 4 - textWidth / 2, y + 16 * (k + 1));
    }
}

function syncModes() {
    var value = document.getElementById('mode').value;
    if (value) {
        var inputs = document.getElementById('star-modes').querySelectorAll('input');
        for (var k = 0; k < inputs.length; k++) {
            inputs[k].value = value;
        }
    }
}

function clearOverallMode(input) {
    var overall = document.getElementById('mode');
    if (overall.value != input.value) {
        overall.value = '';
    }
}
