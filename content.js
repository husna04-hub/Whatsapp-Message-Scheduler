
function getContacts() {
    const contacts = [];
    const chatList = document.querySelectorAll("#pane-side > div:nth-child(1) > div > div > div");

    chatList.forEach(chat => {
        const contactName = chat.querySelector("span[dir='auto']").innerText;
        contacts.push({ name: contactName, element: chat });
    });

    return contacts;
}

function findContact(name) {
    const contacts = getContacts();
    return contacts.find(contact => contact.name.includes(name));
}

function sendMessage(contact, message) {
    contact.element.click();
    setTimeout(() => {
        const messageBox = document.querySelector("div[title='Type a message']");
        messageBox.innerText = message;
        const inputEvent = new InputEvent('input', { bubbles: true });
        messageBox.dispatchEvent(inputEvent);
        
        const sendButton = document.querySelector("button[data-testid='compose-btn-send']");
        sendButton.click();
    }, 1000); // Delay to ensure the chat is opened
}

function searchAndSendMessage(contactName, message) {
  const contact = findContact(contactName);
  if (contact) {
    sendMessage(contact, message);
  } else {
    console.error('Contact not found.');
  }
}
