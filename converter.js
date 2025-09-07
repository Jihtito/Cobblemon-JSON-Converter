function parse_first_line(line) {
    let gender = "M";
    let nickname = "";
    let species = "";
    let item = "";

    // Check for item
    if (line.includes("@")) {
        split_line = line.split("@");
        line = split_line[0];

        item = `cobblemon:${split_line[1].trim().replace(/ /g, "_").toLowerCase()}`;    // Convert to item name
    }
    
    // Check for gender
    if (line.includes("(M)") || line.includes("(F)")) {
        gender = line.trim().slice(-2, -1);     // Get second to last character
        line = line.trim().slice(0, -3);        // Remove last 3 non-whitespace characters
    }
    
    // Check for species and nickname
    if (line.includes("(")) {
        let index = line.lastIndexOf("(");      // Find final parentheses index to avoid error if nickname contains parentheses
        nickname = line.slice(0, index).trim();                     // Before index
        species = line.slice(index + 1).replace(")", "").trim();    // After index
    } else {
        species = line.trim();
    }

    return { nickname, species, gender, item };
}


function parse_stats(text, default_stats) {
    // Copy in default values
    const stats = { ...default_stats };

    const split_text = text.split("/");
    for (let i = 0; i < split_text.length; i++) {
        const split_stats = split_text[i].trim().split(" ");
        stats[split_stats[1]] = parseInt(split_stats[0]);
    }
    
    return stats;
}


function format_single_json(sterilised_input) {
    // Get data from first line
    const { nickname, species, gender, item } = parse_first_line(sterilised_input[0]);
    sterilised_input.shift();   // Remove first element

    // Define remaining elements
    let evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    let ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    const moves = []

    let ability = "";
    let level = 100;
    let nature = "Serious";

    // Find information within list
    for (let i = 0; i < sterilised_input.length; i++) {
        const line = sterilised_input[i].trim();

        if (line.startsWith("- ")) {
            moves.push(line.slice(2).trim());
        }
        else if (line.startsWith("Ability:")) {
            ability = line.split(":")[1].trim();
        }
        else if (line.startsWith("Level:")) {
            level = parseInt(line.split(":")[1].trim());
        }
        else if (line.endsWith(" Nature")) {
            nature = line.replace("Nature", "").trim();
        }
        else if (line.startsWith("EVs:")) {
            evs = parse_stats(line.split(":")[1].toLowerCase(), evs);
        }
        else if (line.startsWith("IVs:")) {
            ivs = parse_stats(line.split(":")[1].toLowerCase(), ivs);
        }
    }

    // If less than 4 moves are provided, fill out blanks
    while (moves.length < 4) {
        moves.push("");
    }

    // Build JSON
    const result = {
        name: nickname,
        species: species,
        gender: gender,
        level: level,
        item: item,
        ability: ability,
        evs: evs,
        nature: nature,
        ivs: ivs,
        moves: moves
    };

    return result;
}


function convert_sets(text_input) {
    const split_text = text_input.trim().split("\n\n");     // Seperate sets by blank lines

    const raw_sets = [];
    for (let i = 0; i < split_text.length; i++) {
        raw_sets.push(split_text[i].trim());
    }

    const formatted_sets = [];
    for (let i = 0; i < raw_sets.length; i++) {
        const lines = [];
        const raw_lines = raw_sets[i].split("\n");

        for (let j = 0; j < raw_lines.length; j++) {
            const line = raw_lines[j].trim();

            if (line.length > 0) {
                lines.push(line);
            }
        }

        // Once single set has been seperated from the list, format the set
        formatted_sets.push(format_single_json(lines));
    }

    return formatted_sets;
}


function convertAndDisplay() {
    const input = document.getElementById("input_text").value;

    try {
        const jsonOutput = convert_sets(input);
        document.getElementById("output_json").textContent = JSON.stringify(jsonOutput, null, 4);
    } catch (err) {
        document.getElementById("output_json").textContent = "Error converting input: " + err.message;
    }
}


document.getElementById("convert_button").addEventListener("click", convertAndDisplay);
