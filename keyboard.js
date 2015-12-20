// read from keyboard like
// if (keyboard.a) {
//     console.log("The a button was down at this moment in time");
// }
var keyboard = {};

(function () {
    var KEY_MAP = {
      65: 'a',
      66: 'b',
      67: 'c',
      68: 'd',
      69: 'e',
      70: 'f',
      71: 'g',
      72: 'h',
      73: 'i',
      74: 'j',
      75: 'k',
      76: 'l',
      77: 'm',
      78: 'n',
      79: 'o',
      80: 'p',
      81: 'q',
      82: 'r',
      83: 's',
      84: 't',
      85: 'u',
      86: 'v',
      87: 'w',
      88: 'x',
      89: 'y',
      90: 'z',
      13: 'enter',
      16: 'shift',
      27: 'esc',
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      8: 'backspace',
      46: 'delete'
    };

    // initalize all keys to false
    Object.keys(KEY_MAP).forEach(function (key) {
        keyboard[KEY_MAP[key]] = false;
    });

    window.addEventListener('keydown', function (event) {
        keyboard[KEY_MAP[event.keyCode]] = true;
    });

    window.addEventListener('keyup', function (event) {
        keyboard[KEY_MAP[event.keyCode]] = false;
    });
}());

window.addEventListener("keydown", function (event) {
  keyboard[event.key] = event.keyCode;
});