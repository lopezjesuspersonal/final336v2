const eyeIcon = document.querySelector("#eyeIcon");;
eyeIcon.addEventListener("click", () => {
    const isHidden = pwd.type === "password";
    pwd.type = (isHidden) ? "text" : "password";
    eyeIcon.classList.toggle("bi-eye", !isHidden);
    eyeIcon.classList.toggle("bi-eye-slash", isHidden);
});

const eyeIcon1 = document.querySelector("#eyeIcon1")
const pwd1 = document.querySelector('#pwd1')
const eyeIcon2 = document.querySelector("#eyeIcon2")
const pwd2 = document.querySelector('#pwd2')
const eyeIconC = document.querySelectorAll('.iconEye')
eyeIconC.forEach(icon => {
    icon.addEventListener('click', () => {
        const isHidden1 = pwd1.type === "password";
        pwd1.type = (isHidden1) ? "text" : "password";
        eyeIcon1.classList.toggle("bi-eye", !isHidden1);
        eyeIcon1.classList.toggle("bi-eye-slash", isHidden1);
    })
})