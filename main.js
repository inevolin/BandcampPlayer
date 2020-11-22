let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_album = document.querySelector(".track-album");
let track_artist = document.querySelector(".track-artist");
let track_url = document.querySelector(".track-url");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let track_index = 0;
let track_page = 0;
let isPlaying = false;
let updateTimer;

let curr_track = document.createElement('audio');

let track_list = [];

function loadTrack(track_index) {
  if (!track_list.length) return;
  pauseTrack();
  clearInterval(updateTimer);
  resetValues();
  curr_track.src = track_list[track_index].path;
  curr_track.load();

  track_art.style.backgroundImage = "url(" + track_list[track_index].image + ")";
  track_name.textContent = track_list[track_index].name;
  track_album.textContent = track_list[track_index].album;
  track_artist.textContent = track_list[track_index].artist;
  track_url.textContent = 'Album URL'
  track_url.href = track_list[track_index].url;
  updatePlayingStatus();

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);

  $('.playlist tr td a').css({'font-weight': '100', color: '#666'})
  $('.playlist tr td a[data-id='+track_index+']').css({'font-weight': 'bold', color: 'black'})
}

function updatePlayingStatus() {
  $(".now-playing").text('playing ' + (track_index + 1) + " / " + track_list.length);
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

function playpauseTrack() {
  if (!track_list.length) return;
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  if (!track_list.length) return;
  curr_track.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';;
}

function nextTrack() {
  if (!track_list.length) return;
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  if (!track_list.length) return;
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  if (!track_list.length) return;
  seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);

    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}

let genreid = 0;
let subgenreid = 0;
let releasetypes = 'top';

$(document).ready(function() {

    $('.genres').append('<a href="#all" data-id="all">all</a> ');
    $.each(GENRES, function(idx, val) {
        $('.genres').append('<a href="#'+val.norm_name+'" data-id="'+val.norm_name+'">'+val.name+'</a> ');
    })

    $('body').on('click', '.genres a', function(e) {
        e.preventDefault()
        genreid = $(this).data().id
        $('.genres a').css({'font-weight': '100', color: '#666'})
        $(this).css({'font-weight': 'bold', color: 'black'})

        $('.subgenres').empty()
        if (genreid !== 'all')
            $.each(GENRES.find(x => x.norm_name === genreid).subs, function(idx, val) {
                $('.subgenres').append('<a href="#'+val.norm_name+'" data-id="'+val.norm_name+'">'+val.name+'</a> ');
            })

        loadFeaturedTracks(true)
        $('.releasetypes').show()
    })

    $('body').on('click', '.subgenres a', function(e) {
        e.preventDefault()
        subgenreid = $(this).data().id
        $('.subgenres a').css({'font-weight': '100', color: '#666'})
        $(this).css({'font-weight': 'bold', color: 'black'})
        loadFeaturedTracks(true)
    })

    $('.releasetypes a:first').css({'font-weight': 'bold', color: 'black'})
    $('body').on('click', '.releasetypes a', function(e) {
        e.preventDefault()
        releasetypes = $(this).data().id;
        $('.releasetypes a').css({'font-weight': '100', color: '#666'})
        $(this).css({'font-weight': 'bold', color: 'black'})
        loadFeaturedTracks(true)
    })

    $('body').on('click', '.playlist tr td a', function(e) {
        e.preventDefault()
        track_index = $(this).data().id;
        loadTrack(track_index)
        playTrack()
    })

    $('body').on('click', '.load-more', function(e) {
        e.preventDefault()
        track_page++;
        loadFeaturedTracks(false)
    })
    
})
function loadFeaturedTracks(clean) {
    if (clean) {
      track_page = 0;
    }
    let url = 'https://bandcamp.com/api/discover/3/get_web';
    url += '?g=' + genreid
    url += '&gn=0'
    url += '&p=' + track_page
    url += '&s=' + releasetypes // top, new, rec
    url += '&f=all'
    if (!subgenreid)
        url+='&w=0'
    else
        url+='&t='+subgenreid
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
    }).done(function(data) {
        if (clean) {
          $('.playlist').empty()
          track_list = []
          track_index = 0;
        }
        $.each(data.items, function(idx, ft) {
            let oft = {
                name: ft.featured_track.title,
                album: ft.primary_text,
                artist: ft.secondary_text,
                url: 'https://' + ft.url_hints.subdomain + '.bandcamp.com/album/' + ft.url_hints.slug,
                image: 'https://f4.bcbits.com/img/a' + ft.art_id + '_9.jpg',
                path: ft.featured_track.file['mp3-128'],
            }
            track_list.push(oft)
            addToPlaylistTable(ft)
        });

        if (data.items.length < 48)
          $('.load-more').hide()
        else
          $('.load-more').show()

        if (clean) {
          loadTrack(track_index);
          playTrack();
        } else {
          updatePlayingStatus()
        }
    })
}

function addToPlaylistTable(ft) {
  let el = '<a href="#" data-id=' + (track_list.length-1)+ '>' + (track_list.length) + '. ' +  ft.featured_track.title + ' - ' + ft.secondary_text + '</a>'
  let td = '<td>'+el+'</td>'
  let tr = '<tr>'+td+'</tr>'
  $('.playlist').append(tr)
}

const GENRES=[{"id":10,"name":"electronic","norm_name":"electronic","subs":[{"name":"house","norm_name":"house","value":"house"},{"name":"electronica","norm_name":"electronica","value":"electronica"},{"name":"downtempo","norm_name":"downtempo","value":"downtempo"},{"name":"techno","norm_name":"techno","value":"techno"},{"name":"electro","norm_name":"electro","value":"electro"},{"name":"dubstep","norm_name":"dubstep","value":"dubstep"},{"name":"beats","norm_name":"beats","value":"beats"},{"name":"dance","norm_name":"dance","value":"dance"},{"name":"idm","norm_name":"idm","value":"idm"},{"name":"drum & bass","norm_name":"drum-bass","value":"drum-bass"},{"name":"breaks","norm_name":"breaks","value":"breaks"},{"name":"trance","norm_name":"trance","value":"trance"},{"name":"glitch","norm_name":"glitch","value":"glitch"},{"name":"chiptune","norm_name":"chiptune","value":"chiptune"},{"name":"chillwave","norm_name":"chillwave","value":"chillwave"},{"name":"dub","norm_name":"dub","value":"dub"},{"name":"edm","norm_name":"edm","value":"edm"},{"name":"instrumental","norm_name":"instrumental","value":"instrumental"},{"name":"witch house","norm_name":"witch-house","value":"witch-house"},{"name":"garage","norm_name":"garage","value":"garage"},{"name":"juke","norm_name":"juke","value":"juke"},{"name":"footwork","norm_name":"footwork","value":"footwork"},{"name":"vaporwave","norm_name":"vaporwave","value":"vaporwave"},{"name":"synthwave","norm_name":"synthwave","value":"synthwave"}],"value":"electronic"},{"id":23,"name":"rock","norm_name":"rock","subs":[{"name":"indie","norm_name":"indie","value":"indie"},{"name":"prog rock","norm_name":"prog-rock","value":"prog-rock"},{"name":"post-rock","norm_name":"post-rock","value":"post-rock"},{"name":"rock & roll","norm_name":"rock-roll","value":"rock-roll"},{"name":"psychedelic rock","norm_name":"psychedelic-rock","value":"psychedelic-rock"},{"name":"hard rock","norm_name":"hard-rock","value":"hard-rock"},{"name":"garage rock","norm_name":"garage-rock","value":"garage-rock"},{"name":"surf rock","norm_name":"surf-rock","value":"surf-rock"},{"name":"instrumental","norm_name":"instrumental","value":"instrumental"},{"name":"math rock","norm_name":"math-rock","value":"math-rock"},{"name":"rockabilly","norm_name":"rockabilly","value":"rockabilly"}],"value":"rock"},{"id":18,"name":"metal","norm_name":"metal","subs":[{"name":"hardcore","norm_name":"hardcore","value":"hardcore"},{"name":"black metal","norm_name":"black-metal","value":"black-metal"},{"name":"death metal","norm_name":"death-metal","value":"death-metal"},{"name":"thrash metal","norm_name":"thrash-metal","value":"thrash-metal"},{"name":"grindcore","norm_name":"grindcore","value":"grindcore"},{"name":"doom","norm_name":"doom","value":"doom"},{"name":"post hardcore","norm_name":"post-hardcore","value":"post-hardcore"},{"name":"progressive metal","norm_name":"progressive-metal","value":"progressive-metal"},{"name":"metalcore","norm_name":"metalcore","value":"metalcore"},{"name":"sludge metal","norm_name":"sludge-metal","value":"sludge-metal"},{"name":"heavy metal","norm_name":"heavy-metal","value":"heavy-metal"},{"name":"deathcore","norm_name":"deathcore","value":"deathcore"},{"name":"noise","norm_name":"noise","value":"noise"}],"value":"metal"},{"id":2,"name":"alternative","norm_name":"alternative","subs":[{"name":"indie rock","norm_name":"indie-rock","value":"indie-rock"},{"name":"industrial","norm_name":"industrial","value":"industrial"},{"name":"shoegaze","norm_name":"shoegaze","value":"shoegaze"},{"name":"grunge","norm_name":"grunge","value":"grunge"},{"name":"goth","norm_name":"goth","value":"goth"},{"name":"dream pop","norm_name":"dream-pop","value":"dream-pop"},{"name":"emo","norm_name":"emo","value":"emo"},{"name":"math rock","norm_name":"math-rock","value":"math-rock"},{"name":"britpop","norm_name":"britpop","value":"britpop"},{"name":"jangle pop","norm_name":"jangle-pop","value":"jangle-pop"}],"value":"alternative"},{"id":14,"name":"hip-hop/rap","norm_name":"hip-hop-rap","subs":[{"name":"rap","norm_name":"rap","value":"rap"},{"name":"underground hip-hop","norm_name":"underground-hip-hop","value":"underground-hip-hop"},{"name":"instrumental hip-hop","norm_name":"instrumental-hip-hop","value":"instrumental-hip-hop"},{"name":"trap","norm_name":"trap","value":"trap"},{"name":"conscious hip-hop","norm_name":"conscious-hip-hop","value":"conscious-hip-hop"},{"name":"boom-bap","norm_name":"boom-bap","value":"boom-bap"},{"name":"beat-tape","norm_name":"beat-tape","value":"beat-tape"},{"name":"hardcore","norm_name":"hardcore","value":"hardcore"},{"name":"grime","norm_name":"grime","value":"grime"}],"value":"hip-hop-rap"},{"id":11,"name":"experimental","norm_name":"experimental","subs":[{"name":"noise","norm_name":"noise","value":"noise"},{"name":"drone","norm_name":"drone","value":"drone"},{"name":"avant garde","norm_name":"avant-garde","value":"avant-garde"},{"name":"experimental rock","norm_name":"experimental-rock","value":"experimental-rock"},{"name":"improvisation","norm_name":"improvisation","value":"improvisation"},{"name":"sound art","norm_name":"sound-art","value":"sound-art"},{"name":"musique concrete","norm_name":"musique-concrete","value":"musique-concrete"}],"value":"experimental"},{"id":20,"name":"punk","norm_name":"punk","subs":[{"name":"hardcore punk","norm_name":"hardcore-punk","value":"hardcore-punk"},{"name":"garage","norm_name":"garage","value":"garage"},{"name":"pop punk","norm_name":"pop-punk","value":"pop-punk"},{"name":"punk rock","norm_name":"punk-rock","value":"punk-rock"},{"name":"post-punk","norm_name":"post-punk","value":"post-punk"},{"name":"post-hardcore","norm_name":"post-hardcore","value":"post-hardcore"},{"name":"thrash","norm_name":"thrash","value":"thrash"},{"name":"crust punk","norm_name":"crust-punk","value":"crust-punk"},{"name":"folk punk","norm_name":"folk-punk","value":"folk-punk"},{"name":"emo","norm_name":"emo","value":"emo"},{"name":"ska","norm_name":"ska","value":"ska"},{"name":"no wave","norm_name":"no-wave","value":"no-wave"}],"value":"punk"},{"id":12,"name":"folk","norm_name":"folk","subs":[{"name":"singer-songwriter","norm_name":"singer-songwriter","value":"singer-songwriter"},{"name":"folk rock","norm_name":"folk-rock","value":"folk-rock"},{"name":"indie folk","norm_name":"indie-folk","value":"indie-folk"},{"name":"pop folk","norm_name":"pop-folk","value":"pop-folk"},{"name":"traditional","norm_name":"traditional","value":"traditional"},{"name":"experimental folk","norm_name":"experimental-folk","value":"experimental-folk"},{"name":"roots","norm_name":"roots","value":"roots"}],"value":"folk"},{"id":19,"name":"pop","norm_name":"pop","subs":[{"name":"indie pop","norm_name":"indie-pop","value":"indie-pop"},{"name":"synth pop","norm_name":"synth-pop","value":"synth-pop"},{"name":"power pop","norm_name":"power-pop","value":"power-pop"},{"name":"new wave","norm_name":"new-wave","value":"new-wave"},{"name":"dream pop","norm_name":"dream-pop","value":"dream-pop"},{"name":"noise pop","norm_name":"noise-pop","value":"noise-pop"},{"name":"experimental pop","norm_name":"experimental-pop","value":"experimental-pop"},{"name":"electro pop","norm_name":"electro-pop","value":"electro-pop"},{"name":"adult contemporary","norm_name":"adult-contemporary","value":"adult-contemporary"},{"name":"jangle pop","norm_name":"jangle-pop","value":"jangle-pop"},{"name":"j-pop","norm_name":"j-pop","value":"j-pop"}],"value":"pop"},{"id":3,"name":"ambient","norm_name":"ambient","subs":[{"name":"chill-out","norm_name":"chill-out","value":"chill-out"},{"name":"drone","norm_name":"drone","value":"drone"},{"name":"dark ambient","norm_name":"dark-ambient","value":"dark-ambient"},{"name":"electronic","norm_name":"electronic","value":"electronic"},{"name":"soundscapes","norm_name":"soundscapes","value":"soundscapes"},{"name":"field recordings","norm_name":"field-recordings","value":"field-recordings"},{"name":"atmospheric","norm_name":"atmospheric","value":"atmospheric"},{"name":"meditation","norm_name":"meditation","value":"meditation"},{"name":"noise","norm_name":"noise","value":"noise"},{"name":"new age","norm_name":"new-age","value":"new-age"},{"name":"idm","norm_name":"idm","value":"idm"},{"name":"industrial","norm_name":"industrial","value":"industrial"}],"value":"ambient"},{"id":24,"name":"soundtrack","norm_name":"soundtrack","subs":[{"name":"film music","norm_name":"film-music","value":"film-music"},{"name":"video game music","norm_name":"video-game-music","value":"video-game-music"}],"value":"soundtrack"},{"id":26,"name":"world","norm_name":"world","subs":[{"name":"latin","norm_name":"latin","value":"latin"},{"name":"roots","norm_name":"roots","value":"roots"},{"name":"african","norm_name":"african","value":"african"},{"name":"tropical","norm_name":"tropical","value":"tropical"},{"name":"tribal","norm_name":"tribal","value":"tribal"},{"name":"brazilian","norm_name":"brazilian","value":"brazilian"},{"name":"celtic","norm_name":"celtic","value":"celtic"},{"name":"world fusion","norm_name":"world-fusion","value":"world-fusion"},{"name":"cumbia","norm_name":"cumbia","value":"cumbia"},{"name":"gypsy","norm_name":"gypsy","value":"gypsy"},{"name":"new age","norm_name":"new-age","value":"new-age"},{"name":"balkan","norm_name":"balkan","value":"balkan"},{"name":"reggaeton","norm_name":"reggaeton","value":"reggaeton"}],"value":"world"},{"id":15,"name":"jazz","norm_name":"jazz","subs":[{"name":"fusion","norm_name":"fusion","value":"fusion"},{"name":"big band","norm_name":"big-band","value":"big-band"},{"name":"nu jazz","norm_name":"nu-jazz","value":"nu-jazz"},{"name":"modern jazz","norm_name":"modern-jazz","value":"modern-jazz"},{"name":"swing","norm_name":"swing","value":"swing"},{"name":"free jazz","norm_name":"free-jazz","value":"free-jazz"},{"name":"soul jazz","norm_name":"soul-jazz","value":"soul-jazz"},{"name":"latin jazz","norm_name":"latin-jazz","value":"latin-jazz"},{"name":"vocal jazz","norm_name":"vocal-jazz","value":"vocal-jazz"},{"name":"bebop","norm_name":"bebop","value":"bebop"},{"name":"spiritual jazz","norm_name":"spiritual-jazz","value":"spiritual-jazz"}],"value":"jazz"},{"id":1,"name":"acoustic","norm_name":"acoustic","subs":[{"name":"folk","norm_name":"folk","value":"folk"},{"name":"singer-songwriter","norm_name":"singer-songwriter","value":"singer-songwriter"},{"name":"rock","norm_name":"rock","value":"rock"},{"name":"pop","norm_name":"pop","value":"pop"},{"name":"guitar","norm_name":"guitar","value":"guitar"},{"name":"americana","norm_name":"americana","value":"americana"},{"name":"electro-acoustic","norm_name":"electro-acoustic","value":"electro-acoustic"},{"name":"instrumental","norm_name":"instrumental","value":"instrumental"},{"name":"piano","norm_name":"piano","value":"piano"},{"name":"bluegrass","norm_name":"bluegrass","value":"bluegrass"},{"name":"roots","norm_name":"roots","value":"roots"}],"value":"acoustic"},{"id":13,"name":"funk","norm_name":"funk","subs":[{"name":"funk jam","norm_name":"funk-jam","value":"funk-jam"},{"name":"deep funk","norm_name":"deep-funk","value":"deep-funk"},{"name":"funk rock","norm_name":"funk-rock","value":"funk-rock"},{"name":"jazz funk","norm_name":"jazz-funk","value":"jazz-funk"},{"name":"boogie","norm_name":"boogie","value":"boogie"},{"name":"g-funk","norm_name":"g-funk","value":"g-funk"},{"name":"rare groove","norm_name":"rare-groove","value":"rare-groove"},{"name":"electro","norm_name":"electro","value":"electro"},{"name":"go-go","norm_name":"go-go","value":"go-go"}],"value":"funk"},{"id":21,"name":"r&b/soul","norm_name":"r-b-soul","subs":[{"name":"soul","norm_name":"soul","value":"soul"},{"name":"r&b","norm_name":"r-b","value":"r-b"},{"name":"neo-soul","norm_name":"neo-soul","value":"neo-soul"},{"name":"gospel","norm_name":"gospel","value":"gospel"},{"name":"contemporary r&b","norm_name":"contemporary-r-b","value":"contemporary-r-b"},{"name":"motown","norm_name":"motown","value":"motown"},{"name":"urban","norm_name":"urban","value":"urban"}],"value":"r-b-soul"},{"id":9,"name":"devotional","norm_name":"devotional","subs":[{"name":"christian","norm_name":"christian","value":"christian"},{"name":"gospel","norm_name":"gospel","value":"gospel"},{"name":"meditation","norm_name":"meditation","value":"meditation"},{"name":"spiritual","norm_name":"spiritual","value":"spiritual"},{"name":"worship","norm_name":"worship","value":"worship"},{"name":"inspirational","norm_name":"inspirational","value":"inspirational"}],"value":"devotional"},{"id":5,"name":"classical","norm_name":"classical","subs":[{"name":"orchestral","norm_name":"orchestral","value":"orchestral"},{"name":"neo-classical","norm_name":"neo-classical","value":"neo-classical"},{"name":"chamber music","norm_name":"chamber-music","value":"chamber-music"},{"name":"classical piano","norm_name":"classical-piano","value":"classical-piano"},{"name":"contemporary classical","norm_name":"contemporary-classical","value":"contemporary-classical"},{"name":"baroque","norm_name":"baroque","value":"baroque"},{"name":"opera","norm_name":"opera","value":"opera"},{"name":"choral","norm_name":"choral","value":"choral"},{"name":"modern classical","norm_name":"modern-classical","value":"modern-classical"},{"name":"avant garde","norm_name":"avant-garde","value":"avant-garde"}],"value":"classical"},{"id":22,"name":"reggae","norm_name":"reggae","subs":[{"name":"dub","norm_name":"dub","value":"dub"},{"name":"ska","norm_name":"ska","value":"ska"},{"name":"roots","norm_name":"roots","value":"roots"},{"name":"dancehall","norm_name":"dancehall","value":"dancehall"},{"name":"rocksteady","norm_name":"rocksteady","value":"rocksteady"},{"name":"ragga","norm_name":"ragga","value":"ragga"},{"name":"lovers rock","norm_name":"lovers-rock","value":"lovers-rock"}],"value":"reggae"},{"id":27,"name":"podcasts","norm_name":"podcasts","subs":[],"value":"podcasts"},{"id":7,"name":"country","norm_name":"country","subs":[{"name":"bluegrass","norm_name":"bluegrass","value":"bluegrass"},{"name":"country rock","norm_name":"country-rock","value":"country-rock"},{"name":"americana","norm_name":"americana","value":"americana"},{"name":"country folk","norm_name":"country-folk","value":"country-folk"},{"name":"alt-country","norm_name":"alt-country","value":"alt-country"},{"name":"country blues","norm_name":"country-blues","value":"country-blues"},{"name":"western","norm_name":"western","value":"western"},{"name":"singer-songwriter","norm_name":"singer-songwriter","value":"singer-songwriter"},{"name":"outlaw","norm_name":"outlaw","value":"outlaw"},{"name":"honky-tonk","norm_name":"honky-tonk","value":"honky-tonk"},{"name":"roots","norm_name":"roots","value":"roots"},{"name":"hillbilly","norm_name":"hillbilly","value":"hillbilly"}],"value":"country"},{"id":25,"name":"spoken word","norm_name":"spoken-word","subs":[{"name":"poetry","norm_name":"poetry","value":"poetry"},{"name":"inspirational","norm_name":"inspirational","value":"inspirational"},{"name":"storytelling","norm_name":"storytelling","value":"storytelling"},{"name":"self-help","norm_name":"self-help","value":"self-help"}],"value":"spoken-word"},{"id":6,"name":"comedy","norm_name":"comedy","subs":[{"name":"improv","norm_name":"improv","value":"improv"},{"name":"stand-up","norm_name":"stand-up","value":"stand-up"}],"value":"comedy"},{"id":4,"name":"blues","norm_name":"blues","subs":[{"name":"rhythm & blues","norm_name":"rhythm-blues","value":"rhythm-blues"},{"name":"blues rock","norm_name":"blues-rock","value":"blues-rock"},{"name":"country blues","norm_name":"country-blues","value":"country-blues"},{"name":"boogie-woogie","norm_name":"boogie-woogie","value":"boogie-woogie"},{"name":"delta blues","norm_name":"delta-blues","value":"delta-blues"},{"name":"americana","norm_name":"americana","value":"americana"},{"name":"electric blues","norm_name":"electric-blues","value":"electric-blues"},{"name":"gospel","norm_name":"gospel","value":"gospel"},{"name":"bluegrass","norm_name":"bluegrass","value":"bluegrass"}],"value":"blues"},{"id":16,"name":"kids","norm_name":"kids","subs":[{"name":"family music","norm_name":"family-music","value":"family-music"},{"name":"educational","norm_name":"educational","value":"educational"},{"name":"music therapy","norm_name":"music-therapy","value":"music-therapy"},{"name":"lullaby","norm_name":"lullaby","value":"lullaby"},{"name":"baby","norm_name":"baby","value":"baby"}],"value":"kids"},{"id":28,"name":"audiobooks","norm_name":"audiobooks","subs":[],"value":"audiobooks"},{"id":17,"name":"latin","norm_name":"latin","subs":[{"name":"brazilian","norm_name":"brazilian","value":"brazilian"},{"name":"cumbia","norm_name":"cumbia","value":"cumbia"},{"name":"tango","norm_name":"tango","value":"tango"},{"name":"latin rock","norm_name":"latin-rock","value":"latin-rock"},{"name":"flamenco","norm_name":"flamenco","value":"flamenco"},{"name":"salsa","norm_name":"salsa","value":"salsa"},{"name":"reggaeton","norm_name":"reggaeton","value":"reggaeton"},{"name":"merengue","norm_name":"merengue","value":"merengue"},{"name":"bolero","norm_name":"bolero","value":"bolero"},{"name":"méxico d.f.","norm_name":"méxico-d.f.","value":"méxico-d.f."},{"name":"bachata","norm_name":"bachata","value":"bachata"}],"value":"latin"}]