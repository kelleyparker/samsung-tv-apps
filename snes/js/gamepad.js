// Gamepad setup for EmulatorJS (load before data/loader.js).
// - Face buttons by position, like a real SNES pad: Xbox A = SNES B, Xbox B = SNES A, Xbox X = SNES Y,
//   Xbox Y = SNES X (on NES: Xbox A = B, Xbox B = A). EmulatorJS's own default maps by letter.
// - The left stick also drives the D-pad, since SNES/NES games have no analog input.
(function () {
    // RetroPad slot -> keyboard key (EmulatorJS defaults) and standard-gamepad button
    var p1 = {
        0: { value: 'x', value2: 'BUTTON_1' },               // B      <- Xbox A (bottom)
        1: { value: 's', value2: 'BUTTON_3' },               // Y      <- Xbox X (left)
        2: { value: 'v', value2: 'SELECT' },                 // Select <- View
        3: { value: 'enter', value2: 'START' },              // Start  <- Menu
        4: { value: 'up arrow', value2: 'DPAD_UP' },
        5: { value: 'down arrow', value2: 'DPAD_DOWN' },
        6: { value: 'left arrow', value2: 'DPAD_LEFT' },
        7: { value: 'right arrow', value2: 'DPAD_RIGHT' },
        8: { value: 'z', value2: 'BUTTON_2' },               // A      <- Xbox B (right)
        9: { value: 'a', value2: 'BUTTON_4' },               // X      <- Xbox Y (top)
        10: { value: 'q', value2: 'LEFT_TOP_SHOULDER' },     // L      <- LB
        11: { value: 'e', value2: 'RIGHT_TOP_SHOULDER' },    // R      <- RB
        12: { value: 'tab', value2: 'LEFT_BOTTOM_SHOULDER' },
        13: { value: 'r', value2: 'RIGHT_BOTTOM_SHOULDER' },
        14: { value: '', value2: 'LEFT_STICK' },
        15: { value: '', value2: 'RIGHT_STICK' },
        16: { value: 'h', value2: 'LEFT_STICK_X:+1' },
        17: { value: 'f', value2: 'LEFT_STICK_X:-1' },
        18: { value: 'g', value2: 'LEFT_STICK_Y:+1' },
        19: { value: 't', value2: 'LEFT_STICK_Y:-1' },
        20: { value: 'l', value2: 'RIGHT_STICK_X:+1' },
        21: { value: 'j', value2: 'RIGHT_STICK_X:-1' },
        22: { value: 'k', value2: 'RIGHT_STICK_Y:+1' },
        23: { value: 'i', value2: 'RIGHT_STICK_Y:-1' },
        24: { value: '1' }, 25: { value: '2' }, 26: { value: '3' }, 27: {}, 28: {}, 29: {}
    };
    window.EJS_defaultControls = { 0: p1, 1: {}, 2: {}, 3: {} };

    // Left stick -> D-pad: report D-pad buttons 12-15 as pressed while the stick is pushed past halfway
    if (!navigator.getGamepads) { return; }
    var nativeGet = navigator.getGamepads.bind(navigator);
    var PUSH = 0.5;
    navigator.getGamepads = function () {
        var pads = nativeGet(), out = [];
        for (var i = 0; i < pads.length; i++) {
            var p = pads[i];
            if (!p || p.mapping !== 'standard' || p.buttons.length < 16 || p.axes.length < 2) { out.push(p); continue; }
            var x = p.axes[0], y = p.axes[1];
            var stick = { 12: y < -PUSH, 13: y > PUSH, 14: x < -PUSH, 15: x > PUSH };
            var buttons = [];
            for (var b = 0; b < p.buttons.length; b++) {
                var src = p.buttons[b], on = src.pressed || !!stick[b];
                buttons.push({ pressed: on, touched: on || src.touched, value: stick[b] ? 1 : src.value });
            }
            out.push({ id: p.id, index: p.index, mapping: p.mapping, connected: p.connected,
                timestamp: p.timestamp, axes: p.axes, buttons: buttons });
        }
        return out;
    };
})();
