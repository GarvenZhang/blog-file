import $ from '../lib/$'

const $player = $('#player')

$player.addEventListener('loadedmetadata', loadHandle, false)

function loadHandle() {

  var sec = parseInt(location.search.substr(1));

  if (!isNaN(sec)) {
    $player.currentTime = sec;
  }
}


