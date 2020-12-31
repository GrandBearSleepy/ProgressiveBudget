
//create indexedDB version 1
const request = indexedDB.open('bugdge', 1);

//create collection 'pending' with auto increment id
request.onupgradeneeded = () => {
    const db = request.result;
    db.createObjectStore('pending', { autoIncrement: true });
};

//check online status, if online sync data with remote database
request.onsuccess = () => {
    if (navigator.onLine) {
        checkDatabase()
    }
};

//error info
request.onerror = (event) => {
    console.log('Woops' + event.target.errorCode);
};

//save data in indexedDB
function saveRecord(record) {

    const db = request.result;

    const trasaction = db.transaction(['pending'], 'readwrite');

    const store = trasaction.objectStore('pending');

    store.add(record);
};

//sync with remote database then clear indexedDB
function checkDatabase() {

    const db = request.result;

    const transaction = db.transaction(['pending'], 'readwrite');

    const store = transaction.objectStore('pending');

    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(() => {

                    const transaction = db.transaction(['pending'], 'readwrite');

                    const store = transaction.objectStore('pending');

                    store.clear();
                });
        }
    };
}


window.addEventListener('online', checkDatabase);