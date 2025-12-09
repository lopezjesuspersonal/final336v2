const eyeIcon = document.querySelector("#eyeIcon");
const pwd = document.querySelector("#pwd");
if (eyeIcon && pwd) {
    eyeIcon.addEventListener("click", () => {
        const isHidden = pwd.type === "password";
        pwd.type = (isHidden) ? "text" : "password";
        eyeIcon.classList.toggle("bi-eye", !isHidden);
        eyeIcon.classList.toggle("bi-eye-slash", isHidden);
    });
}

const eyeIcons = document.querySelectorAll('.iconEye');
eyeIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const target = icon.dataset.target;
        const pwdField = document.querySelector(target);
        if (pwdField) {
            const isHidden = pwdField.type === "password";
            pwdField.type = (isHidden) ? "text" : "password";
            icon.classList.toggle("bi-eye", !isHidden);
            icon.classList.toggle("bi-eye-slash", isHidden);
        }
    });
});