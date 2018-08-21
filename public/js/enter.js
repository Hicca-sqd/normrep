var enter = document.getElementById('enter-block');
// var isShowEnter = false;

// function toogleEnter() {
// 	if(isShowEnter){
// 		enter.style.display = 'none';
// 	} else{
// 		enter.style.display = 'block';

// 	}
// 	isShowEner = !isShowEnter;
// }


function ShowEnter() {
	enter.style.display = 'block';
}

function outsideClick(e) {
	if(!enter.contains(e.target)){ //если он не содержить внутри дропдовн то мы скрываем его
		enter.style.display = 'none';
	}
}

document.addEventListener('click',outsideClick, true, true);