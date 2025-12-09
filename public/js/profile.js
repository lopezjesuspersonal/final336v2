const openProfileBtn = document.querySelector('#openProfileModal')
const closeProfileBtn = document.querySelector('#closeProfileModal')
const profileModal = document.querySelector('#profileModal')

openProfileBtn.addEventListener('click', openProfileModal)
closeProfileBtn.addEventListener('click', closeProfileModal)

function openProfileModal() {
    profileModal.showModal()
}

function closeProfileModal() {
    profileModal.close()
}