let username = document.querySelector('#registerUsername');
let password = document.querySelector('#registerPassword');
let checkPassword = document.querySelector('#registerCheckPassword');

document.querySelector('#registerBtn').addEventListener('click', verifyAndRegister)

function verifyAndRegister() {
    if (username.value.trim() === '' || password.value.trim() === '' || checkPassword.value.trim() === '') {
        // alert('Please fill in all fields.')
        document.querySelector('#registerWarning').innerText = 'Please fill in all fields.'
        document.querySelector('#registerWarning').style.color = 'red';
        event.preventDefault();
        return
    }
}