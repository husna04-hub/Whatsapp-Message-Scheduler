chrome.alarms.onAlarm.addListener(function (alarm) {
  console.log('Alarm triggered:', alarm.name);
  if (alarm.name === 'sendMessage') {
      chrome.storage.local.get(['contactName', 'message'], function (data) {
          console.log('Data retrieved:', data);
          const { contactName, message } = data;

          chrome.tabs.query({ url: "*://web.whatsapp.com/*" }, function (tabs) {
              if (tabs.length > 0) {
                  const tabId = tabs[0].id;
                  console.log('WhatsApp Web tab found:', tabId);

                  chrome.scripting.executeScript({
                      target: { tabId: tabId },
                      func: searchAndSendMessage,
                      args: [contactName, message]
                  });
              } else {
                  console.error('Please open WhatsApp Web.');
              }
          });
      });
  }
});

function searchAndSendMessage(contactName, message) {
  console.log('Searching and sending message to:', contactName);

  function findContact(name) {
      const contacts = getContacts();
      console.log('Contacts retrieved:', contacts);
      return contacts.find(contact => contact.name.includes(name));
  }

  function getContacts() {
      const contacts = [];
      const chatList = document.querySelectorAll("div[role='listitem']");
      console.log('Chat list elements:', chatList);

      chatList.forEach(chat => {
          const contactName = chat.querySelector("span[dir='auto']").innerText;
          contacts.push({ name: contactName, element: chat });
      });

      console.log('Contacts:', contacts);
      return contacts;
  }

  async function sendMessage(contact, message) {
      console.log('Sending message to:', contact);
      contact.element.click(); // Click the contact

      // Wait for the message box to become available
      await new Promise(resolve => {
          const interval = setInterval(() => {
              const messageBox = document.querySelector("p.selectable-text.copyable-text.x15bjb6t.x1n2onr6");
              if (messageBox) {
                  clearInterval(interval);
                  resolve();
              }
          }, 500); // Check every 500ms
      });

      // Now search for the message box
      const messageBox = document.querySelector("p.selectable-text.copyable-text.x15bjb6t.x1n2onr6");
      if (messageBox) {
          messageBox.focus();
          document.execCommand('insertText', false, message);
          console.log('Message typed:', message);

          // Check for the send button
          const sendButton = document.querySelector("span[data-icon='send']");
          if (sendButton) {
              const button = sendButton.closest('button'); // Get the closest button element
              if (button) {
                  button.click(); // Click the button
                  console.log('Message sent');
              } else {
                  console.error('Parent button not found.');
              }
          } else {
              console.error('Send button not found. Trying fallback...');
              // Fallback: Try to find the button again after a short delay
              setTimeout(() => {
                  const fallbackSendButton = document.querySelector("span[data-icon='send']");
                  if (fallbackSendButton) {
                      const button = fallbackSendButton.closest('button');
                      if (button) {
                          button.click();
                          console.log('Message sent using fallback');
                      } else {
                          console.error('Fallback: Parent button not found.');
                      }
                  } else {
                      console.error('Fallback: Send button still not found.');
                  }
              }, 1000); // Wait a second and try again
          }
      } else {
          console.error('Message box not found after loading chat.');
      }
  }

  const contact = findContact(contactName);
  if (contact) {
      console.log('Contact found:', contact);
      sendMessage(contact, message);
  } else {
      console.error('Contact not found.');
  }
}
