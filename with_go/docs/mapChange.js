$dongDaegu = document.querySelector('#dongDaegu');
$daeguAirport = document.querySelector('#daeguAirport');
$incheonAirport = document.querySelector('#incheonAirport');
$gyeongju = document.querySelector('#gyeongju');
$dongDaegu_btn = document.querySelector('#dongDaegu_btn');
$daeguAirport_btn = document.querySelector('#daeguAirport_btn');
$incheonAirport_btn = document.querySelector('#incheonAirport_btn');
$gyeongju_btn = document.querySelector('#gyeongju_btn');

$dongDaegu_btn.addEventListener('click', () => {
    event.preventDefault();
    $dongDaegu.style.display = 'block';
    $daeguAirport.style.display = 'none';
    $incheonAirport.style.display = 'none';
    $gyeongju.style.display = 'none';
})

$daeguAirport_btn.addEventListener('click', () => {
    event.preventDefault();
    $daeguAirport.style.display = 'block';
    $dongDaegu.style.display = 'none';
    $incheonAirport.style.display = 'none';
    $gyeongju.style.display = 'none';
})

$incheonAirport_btn.addEventListener('click', () => {
    event.preventDefault();
    $incheonAirport.style.display = 'block';
    $dongDaegu.style.display = 'none';
    $daeguAirport.style.display = 'none';
    $gyeongju.style.display = 'none';
})

$gyeongju_btn.addEventListener('click', () => {
    event.preventDefault();
    $gyeongju.style.display = 'block';
    $dongDaegu.style.display = 'none';
    $daeguAirport.style.display = 'none';
    $incheonAirport.style.display = 'none';
})