// JS/app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. FIREBASE INITIALIZATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCLcsIXF1gTG4VzfCL6UjPzSE15XCRM-KI",
    authDomain: "saveanything-storage.firebaseapp.com",
    projectId: "saveanything-storage",
    storageBucket: "saveanything-storage.firebasestorage.app",
    messagingSenderId: "203505194678",
    appId: "1:203505194678:web:f423fa8e883afa29b0b817",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const itemsCollection = collection(db, "savedItems");

// --- 2. DUMMY DATA ---
const dummyItems = [
    {
        content: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        type: "link",
        category: "Study",
        note: "Comprehensive documentation for modern JavaScript APIs and syntax.",
        isFavorite: true,
        createdAt: serverTimestamp(),
    },
    {
        content: "Ship new dashboard filters & mobile responsiveness by Friday.",
        type: "text",
        category: "Work",
        note: "Sprint priority 1. Review with team during morning standup.",
        isFavorite: false,
        createdAt: serverTimestamp(),
    },
    {
        content:
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
        type: "image",
        category: "Work",
        note: "Inspiration reference for minimal desk setup workspace.",
        isFavorite: true,
        createdAt: serverTimestamp(),
    },
    {
        content: "https://www.instagram.com/reel/C8xyz123abc/",
        type: "reel",
        category: "Personal",
        note: "15-minute quick healthy meal prep ideas for weeknights.",
        isFavorite: false,
        createdAt: serverTimestamp(),
    },
    {
        content: "Atomic Habits - Chapter 3 summary notes on trigger stacking.",
        type: "text",
        category: "Study",
        note: "Pair new habits directly after an existing routine.",
        isFavorite: false,
        createdAt: serverTimestamp(),
    },
];

// --- 3. SEED DUMMY DATA ---
async function seedDummyDataIfEmpty() {
    try {
        const snapshot = await getDocs(itemsCollection);
        if (snapshot.empty) {
            console.log("No items found. Seeding dummy data to Firestore...");
            for (const item of dummyItems) {
                await addDoc(itemsCollection, item);
            }
            console.log("Dummy data successfully loaded!");
        }
    } catch (err) {
        console.error("Error seeding dummy data:", err);
    }
}

// --- 4. DOM ELEMENTS ---
const saveInput = document.getElementById("saveAnythingInput");
const contentTypeSelect = document.getElementById("contentType");
const notePopup = document.getElementById("quickNotePopup");
const closeNoteBtn = document.getElementById("closeNoteBtn");
const noteTextarea = document.getElementById("itemNoteInput");
const saveBtn = document.getElementById("saveAnythingBtn");
const container = document.getElementById("savedItemsContainer");
const itemsCountEl = document.getElementById("itemsCount");
const emptyState = document.getElementById("emptyState");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const favoritesFilter = document.getElementById("favoritesFilter");

// Active filter state
let allItems = [];
const currentFilters = {
    type: "all",
    category: "all",
    favoritesOnly: false,
};

function applyFiltersAndRender() {
    let filtered = allItems.filter((item) => {
        // Match Type
        const matchesType =
            currentFilters.type === "all" || item.type === currentFilters.type;

        // Match Category
        const matchesCategory =
            currentFilters.category === "all" ||
            item.category === currentFilters.category;

        // Match Favorites
        const matchesFavorites =
            !currentFilters.favoritesOnly || item.isFavorite === true;

        return matchesType && matchesCategory && matchesFavorites;
    });

    renderItems(filtered);
}

// --- 5. POPUP TOGGLE LOGIC ---
function updatePopupVisibility() {
    const isTextSelected = contentTypeSelect.value === "text";
    const hasInput = saveInput.value.trim().length > 0;

    if (isTextSelected || hasInput) {
        notePopup.classList.add("active");
        if (isTextSelected && document.activeElement !== saveInput) {
            noteTextarea.focus();
        }
    } else {
        notePopup.classList.remove("active");
    }
}

contentTypeSelect.addEventListener("change", updatePopupVisibility);
saveInput.addEventListener("input", updatePopupVisibility);

closeNoteBtn.addEventListener("click", () => {
    notePopup.classList.remove("active");
});

document.addEventListener("click", (e) => {
    const isInside =
        notePopup.contains(e.target) ||
        saveInput.contains(e.target) ||
        contentTypeSelect.contains(e.target) ||
        saveBtn.contains(e.target);

    if (!isInside) {
        notePopup.classList.remove("active");
    }
});

// --- 6. RENDER LOGIC ---
function getBadgeIcon(type) {
    switch (type) {
        case "link":
            return "bi-link-45deg";
        case "image":
            return "bi-image";
        case "reel":
            return "bi-camera-reels";
        default:
            return "bi-card-text";
    }
}

function renderItems(items) {
    itemsCountEl.textContent = `${items.length} items`;

    if (items.length === 0) {
        container.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    container.innerHTML = items
        .map(
            (item) => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm border-0 saved-item-card" style="border-radius: 12px; background: #fff; padding: 16px;">
                
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bg-light text-dark text-capitalize border" style="font-size: 0.75rem; padding: 5px 8px;">
                        <i class="bi ${getBadgeIcon(item.type)} me-1"></i> ${item.type}
                    </span>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.75rem;">
                        ${item.category || "General"}
                    </span>
                </div>

                <div class="item-content mb-2" style="font-weight: 500; word-break: break-word; color: #1e293b;">
                    ${item.type === "link" || item.type === "reel"
                        ? `<a href="${item.content}" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-primary"><i class="bi bi-box-arrow-up-right me-1"></i>${item.content}</a>`
                        : item.type === "image"
                            ? `<img src="${item.content}" class="img-fluid rounded mb-2" style="max-height: 160px; width: 100%; object-fit: cover;" alt="Saved Image"/>`
                            : `<p class="mb-0">${item.content}</p>`
                    }
                </div>

                ${item.note
                    ? `<div class="item-note p-2 rounded bg-light border-start border-3 border-info mb-2" style="font-size: 0.85rem; color: #475569;">
                           <i class="bi bi-journal-text me-1 text-info"></i> ${item.note}
                       </div>`
                    : ""
                }

                <div class="card-footer-action mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                    <span class="text-muted" style="font-size: 0.75rem;">
                        <i class="bi bi-clock me-1"></i>Just now
                    </span>
                    <div class="d-flex align-items-center gap-2">
                        <!-- Favorite Toggle -->
                        <button 
                            type="button" 
                            class="btn btn-sm p-1 border-0 favorite-toggle-btn ${item.isFavorite ? 'text-warning' : 'text-secondary'}" 
                            data-id="${item.id}" 
                            data-favorite="${item.isFavorite || false}"
                            title="${item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                            <i class="bi ${item.isFavorite ? 'bi-star-fill' : 'bi-star'}"></i>
                        </button>

                        <!-- Delete Button -->
                        <button 
                            type="button" 
                            class="btn btn-sm p-1 border-0 text-danger delete-item-btn" 
                            data-id="${item.id}"
                            title="Delete item">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `,
        )
        .join("");
}

// --- 7. REALTIME LISTENER ---
onSnapshot(
    itemsCollection,
    (snapshot) => {
        allItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Sort newest first
        allItems.sort((a, b) => {
            const timeA = a.createdAt?.toMillis
                ? a.createdAt.toMillis()
                : a.createdAt || 0;
            const timeB = b.createdAt?.toMillis
                ? b.createdAt.toMillis()
                : b.createdAt || 0;
            return timeB - timeA;
        });

        // Re-apply filters whenever data updates from Firestore
        applyFiltersAndRender();
    },
    (error) => {
        console.error("Firestore listener error:", error);
    },
);

// --- 8. SAVE BUTTON HANDLER ---
saveBtn.addEventListener("click", async () => {
    const content = saveInput.value.trim();
    const note = noteTextarea.value.trim();

    if (!content && !note) return;

    let selectedType = contentTypeSelect.value;
    if (selectedType === "auto") {
        selectedType = content.startsWith("http") ? "link" : "text";
    }

    try {
        await addDoc(itemsCollection, {
            content: content || "Untitled Note",
            note: note,
            type: selectedType,
            category: "General",
            isFavorite: false,
            createdAt: serverTimestamp(),
        });

        saveInput.value = "";
        noteTextarea.value = "";
        contentTypeSelect.value = "auto";
        notePopup.classList.remove("active");
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});

// --- 9. FILTER EVENT LISTENERS ---
// Filter by Type
typeFilter.addEventListener("change", (e) => {
    currentFilters.type = e.target.value;
    applyFiltersAndRender();
});

// Filter by Category
categoryFilter.addEventListener("change", (e) => {
    currentFilters.category = e.target.value;
    applyFiltersAndRender();
});

// Toggle Favorites Only
favoritesFilter.addEventListener("click", () => {
    currentFilters.favoritesOnly = !currentFilters.favoritesOnly;

    // Toggle active UI style on the button
    if (currentFilters.favoritesOnly) {
        favoritesFilter.classList.add("btn-warning", "text-dark");
        favoritesFilter.classList.remove("text-muted");
    } else {
        favoritesFilter.classList.remove("btn-warning", "text-dark");
    }

    applyFiltersAndRender();
});

// --- 10. FAVORITE & DELETE EVENT HANDLERS ---
container.addEventListener("click", async (e) => {
    // 1. Handle Favorite Toggle
    const favBtn = e.target.closest(".favorite-toggle-btn");
    if (favBtn) {
        const itemId = favBtn.dataset.id;
        const currentStatus = favBtn.dataset.favorite === "true";
        const itemDocRef = doc(db, "savedItems", itemId);

        try {
            await updateDoc(itemDocRef, {
                isFavorite: !currentStatus
            });
        } catch (err) {
            console.error("Error updating favorite:", err);
        }
        return;
    }

    // 2. Handle Delete
    const deleteBtn = e.target.closest(".delete-item-btn");
    if (deleteBtn) {
        const itemId = deleteBtn.dataset.id;
        
        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        const itemDocRef = doc(db, "savedItems", itemId);

        try {
            await deleteDoc(itemDocRef);
        } catch (err) {
            console.error("Error deleting item:", err);
        }
    }
});
// Run seed check on page load
seedDummyDataIfEmpty();
