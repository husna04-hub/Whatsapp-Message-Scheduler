document.getElementById('scheduleBtn').addEventListener('click', function() {
  const contactName = document.getElementById('contactName').value;
  const message = document.getElementById('message').value;
  const time = new Date(document.getElementById('time').value);

  if (contactName && message && time) {
    const now = new Date();
    const delay = time - now;

    if (delay > 0) {
      chrome.storage.local.set({ contactName, message }, function() {
        console.log('Data set in storage:', { contactName, message });
        chrome.alarms.create('sendMessage', { when: Date.now() + delay });
        console.log('Alarm created to trigger in', delay, 'ms');
        window.close();
      });
    } else {
      alert('Please select a future time.');
    }
  } else {
    alert('Please fill out all fields.');
  }
});

document.getElementById('debugBtn').addEventListener('click', function() {
  chrome.alarms.getAll(function(alarms) {
    console.log('Scheduled alarms:', alarms);
  });

  chrome.storage.local.get(['contactName', 'message'], function(data) {
    console.log('Stored data:', data);
  });
});
