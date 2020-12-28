let db;

const request = indexedDB.open('bugdge', 1);

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase()
    }
};

request.onerror = (event) => {
    console.log('Woops' + event.target.errorCode);
};

function saveRecord(record) {

    const trasaction = db.transaction(['pending'], 'readwrite');

    const store = trasaction.objectStore('pending');

    store.add(record);
};

function checkDatabase() {
    // open a transaction on your pending db
    const transaction = db.transaction(["pending"], "readwrite");
    // access your pending object store
    const store = transaction.objectStore("pending");
    // get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    // if successful, open a transaction on your pending db
                    const transaction = db.transaction(["pending"], "readwrite");

                    // access your pending object store
                    const store = transaction.objectStore("pending");

                    // clear all items in your store
                    store.clear();
                });
        }
    };
}


window.addEventListener('online', checkDatabase);