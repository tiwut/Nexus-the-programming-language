// --- 1. SETUP BLOCKLY ---
const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    scrollbars: true,
    trashcan: true,
    grid: { spacing: 25, length: 3, colour: '#444', snap: true },
    zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3 },
    theme: Blockly.Themes.Dark
});

// --- 2. CUSTOM BLOCK DEFINITIONS (Visuals) ---

Blockly.defineBlocksWithJsonArray([
    {
        "type": "nexus_out",
        "message0": "out %1",
        "args0": [{ "type": "input_value", "name": "TEXT" }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 40,
        "tooltip": "Print output to console"
    },
    {
        "type": "nexus_input",
        "message0": "input to variable %1 prompt %2",
        "args0": [
            { "type": "field_variable", "name": "VAR", "variable": "myVar" },
            { "type": "input_value", "name": "PROMPT" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 40,
        "tooltip": "Ask user for input and save to variable"
    },
    {
        "type": "nexus_wait",
        "message0": "wait %1 seconds",
        "args0": [{ "type": "input_value", "name": "SECONDS" }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 40,
        "tooltip": "Pause execution"
    },
    {
        "type": "nexus_math_calc",
        "message0": "%1 %2 %3",
        "args0": [
            { "type": "input_value", "name": "A" },
            { "type": "field_dropdown", "name": "OP", "options": [
                ["+", "+"], ["-", "-"], ["*", "*"], ["/", "/"]
            ]},
            { "type": "input_value", "name": "B" }
        ],
        "output": null,
        "colour": 230,
        "tooltip": "Math operations"
    },
    // LOGIC
    {
        "type": "nexus_if",
        "message0": "if %1",
        "args0": [{ "type": "input_value", "name": "CONDITION" }],
        "message1": "do %1",
        "args1": [{ "type": "input_statement", "name": "DO" }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 210,
        "tooltip": "If condition (based on regex keywords)"
    },
    {
        "type": "nexus_loop",
        "message0": "loop %1",
        "args0": [{ "type": "input_statement", "name": "DO" }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "Infinite loop (use 'break' if available)"
    },
    // GUI
    {
        "type": "nexus_gui_msg",
        "message0": "gui.msg( %1 )",
        "args0": [{ "type": "input_value", "name": "TEXT" }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "Show a popup message"
    },
    {
        "type": "nexus_gui_window",
        "message0": "gui.window( Title: %1 )",
        "args0": [{ "type": "input_value", "name": "TITLE" }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "Initialize window"
    },
    {
        "type": "nexus_gui_label",
        "message0": "gui.label( Text: %1 )",
        "args0": [{ "type": "input_value", "name": "TEXT" }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120
    },
    {
        "type": "nexus_gui_button",
        "message0": "gui.button( Text: %1, Runs Function: %2 )",
        "args0": [
            { "type": "input_value", "name": "LABEL" },
            { "type": "input_value", "name": "FUNC" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "Create a button that calls a function"
    },
    {
        "type": "nexus_gui_run",
        "message0": "gui.run()",
        "previousStatement": null,
        "colour": 120,
        "tooltip": "Start the GUI event loop"
    },
    // IO
    {
        "type": "nexus_io_write",
        "message0": "io.write( File: %1, Content: %2 )",
        "args0": [
            { "type": "input_value", "name": "FILENAME" },
            { "type": "input_value", "name": "CONTENT" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 30,
        "tooltip": "Write text to a file"
    },
    {
        "type": "nexus_io_read",
        "message0": "io.read( File: %1 )",
        "args0": [{ "type": "input_value", "name": "FILENAME" }],
        "output": null,
        "colour": 30,
        "tooltip": "Read text from a file"
    },
    // Advanced / Generic
    {
        "type": "nexus_generic_module",
        "message0": "Module Call: %1 . %2 ( Args: %3 )",
        "args0": [
            { "type": "field_dropdown", "name": "MOD", "options": [["sys", "sys"], ["net", "net"], ["math", "math"]]},
            { "type": "field_input", "name": "FUNC", "text": "command" },
            { "type": "input_value", "name": "ARGS" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 260,
        "tooltip": "Call generic modules defined in regex"
    },
    {
        "type": "nexus_comment",
        "message0": "# %1",
        "args0": [{ "type": "field_input", "name": "TEXT", "text": "Comment..." }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 200
    }
]);

// --- 3. NEXUS CODE GENERATOR ---

const nexusGen = new Blockly.Generator('Nexus');
nexusGen.PRECEDENCE = 0;

// Helper: Ensure strings are quoted
function forceQuote(code) {
    // If it's a variable call, don't quote. If it's raw text, quote it.
    // For simplicity in Blockly generators, we often return quoted strings from 'text' block.
    // The C++ parser trims quotes manually.
    return code;
}

// Text
nexusGen['text'] = function(block) {
    const code = block.getFieldValue('TEXT');
    return ['"' + code + '"', nexusGen.PRECEDENCE];
};

nexusGen['math_number'] = function(block) {
    const code = block.getFieldValue('NUM');
    return [code, nexusGen.PRECEDENCE];
};

nexusGen['nexus_out'] = function(block) {
    const value = nexusGen.valueToCode(block, 'TEXT', nexusGen.PRECEDENCE) || '""';
    return 'out ' + value + '\n';
};

nexusGen['nexus_wait'] = function(block) {
    const value = nexusGen.valueToCode(block, 'SECONDS', nexusGen.PRECEDENCE) || '1';
    return 'wait ' + value + '\n';
};

nexusGen['variables_set'] = function(block) {
    const argument0 = nexusGen.valueToCode(block, 'VALUE', nexusGen.PRECEDENCE) || '0';
    const varName = Blockly.Common.names.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    return 'set ' + varName + ' = ' + argument0 + '\n';
};

nexusGen['variables_get'] = function(block) {
    const code = Blockly.Common.names.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    return [code, nexusGen.PRECEDENCE];
};

nexusGen['nexus_input'] = function(block) {
    const prompt = nexusGen.valueToCode(block, 'PROMPT', nexusGen.PRECEDENCE) || '"Input"';
    const varName = Blockly.Common.names.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    return 'input ' + varName + ' ' + prompt + '\n';
};

nexusGen['nexus_math_calc'] = function(block) {
    const a = nexusGen.valueToCode(block, 'A', nexusGen.PRECEDENCE) || '0';
    const b = nexusGen.valueToCode(block, 'B', nexusGen.PRECEDENCE) || '0';
    const op = block.getFieldValue('OP');
    return [a + ' ' + op + ' ' + b, nexusGen.PRECEDENCE];
};

// Logic
nexusGen['nexus_if'] = function(block) {
    const condition = nexusGen.valueToCode(block, 'CONDITION', nexusGen.PRECEDENCE) || '1';
    const branch = nexusGen.statementToCode(block, 'DO');
    return 'if ' + condition + '\n' + branch + 'end\n';
};

nexusGen['nexus_loop'] = function(block) {
    const branch = nexusGen.statementToCode(block, 'DO');
    return 'loop\n' + branch + 'end\n';
};

nexusGen['logic_compare'] = function(block) {
    const A = nexusGen.valueToCode(block, 'A', nexusGen.PRECEDENCE) || '0';
    const B = nexusGen.valueToCode(block, 'B', nexusGen.PRECEDENCE) || '0';
    const op = block.getFieldValue('OP'); 
    // Mapper for blockly ops to Nexus ops
    const map = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
    return [A + ' ' + map[op] + ' ' + B, nexusGen.PRECEDENCE];
};

// Functions (Standard Blockly -> Nexus fn/end)
nexusGen['procedures_defnoreturn'] = function(block) {
    const funcName = nexusGen.nameDB_.getName(block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
    const branch = nexusGen.statementToCode(block, 'STACK');
    return 'fn ' + funcName + '\n' + branch + 'end\n';
};

nexusGen['procedures_callnoreturn'] = function(block) {
    const funcName = nexusGen.nameDB_.getName(block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
    return funcName + '()\n';
};

// GUI
nexusGen['nexus_gui_msg'] = function(block) {
    const text = nexusGen.valueToCode(block, 'TEXT', nexusGen.PRECEDENCE) || '""';
    return 'gui.msg(' + text + ')\n';
};

nexusGen['nexus_gui_window'] = function(block) {
    const title = nexusGen.valueToCode(block, 'TITLE', nexusGen.PRECEDENCE) || '"Window"';
    return 'gui.window(' + title + ')\n';
};

nexusGen['nexus_gui_label'] = function(block) {
    const text = nexusGen.valueToCode(block, 'TEXT', nexusGen.PRECEDENCE) || '""';
    return 'gui.label(' + text + ')\n';
};

nexusGen['nexus_gui_button'] = function(block) {
    const label = nexusGen.valueToCode(block, 'LABEL', nexusGen.PRECEDENCE) || '"Button"';
    const func = nexusGen.valueToCode(block, 'FUNC', nexusGen.PRECEDENCE) || '"func"';
    // Remove quotes around function name for button call logic if needed, 
    // but C++ parser splits by quotes, so keeping them is safer.
    return 'gui.button(' + label + ', ' + func + ')\n';
};

nexusGen['nexus_gui_run'] = function(block) {
    return 'gui.run()\n';
};

// IO
nexusGen['nexus_io_write'] = function(block) {
    const file = nexusGen.valueToCode(block, 'FILENAME', nexusGen.PRECEDENCE) || '"file.txt"';
    const content = nexusGen.valueToCode(block, 'CONTENT', nexusGen.PRECEDENCE) || '""';
    return 'io.write(' + file + ', ' + content + ')\n';
};

nexusGen['nexus_io_read'] = function(block) {
    const file = nexusGen.valueToCode(block, 'FILENAME', nexusGen.PRECEDENCE) || '"file.txt"';
    return ['io.read(' + file + ')', nexusGen.PRECEDENCE];
};

// Generic Module
nexusGen['nexus_generic_module'] = function(block) {
    const mod = block.getFieldValue('MOD');
    const func = block.getFieldValue('FUNC');
    const args = nexusGen.valueToCode(block, 'ARGS', nexusGen.PRECEDENCE) || '';
    return mod + '.' + func + '(' + args + ')\n';
};

nexusGen['nexus_comment'] = function(block) {
    return '# ' + block.getFieldValue('TEXT') + '\n';
}

// --- 4. WEBSITE LOGIC ---

function updateCode() {
    const code = nexusGen.workspaceToCode(workspace);
    document.getElementById('codeOutput').textContent = code;
}
workspace.addChangeListener(updateCode);

function downloadCode() {
    const code = nexusGen.workspaceToCode(workspace);
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "program.nx";
    a.click();
}

function simulateCode() {
    const rawCode = nexusGen.workspaceToCode(workspace);
    const consoleDiv = document.getElementById('consoleOutput');
    consoleDiv.innerHTML = "";
    
    const log = (msg) => {
        consoleDiv.innerHTML += `<div><span style="color:#0f0">›</span> ${msg}</div>`;
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    };

    log("Starting simulation...");
    
    // Simple mock execution for browser preview
    const lines = rawCode.split('\n');
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        if (line.startsWith('out ')) {
            log(line.substring(4).replace(/"/g, ''));
        } else if (line.startsWith('gui.msg')) {
            log("[GUI Alert]: " + line.substring(8, line.length-1));
        } else if (line.startsWith('gui.button')) {
            log("[GUI Button Created]: " + line);
        } else if (line.startsWith('io.write')) {
            log("[File I/O]: Writing to file...");
        } else if (line.startsWith('fn ')) {
            log("[Function Defined]: " + line.substring(3));
        }
    });
    
    log("<span style='color:#888'>Simulation ended (Logic is limited in browser)</span>");
}