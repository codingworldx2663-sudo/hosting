document.addEventListener("DOMContentLoaded", () => {
"use strict";


// ==========================================
// 1. SELECT HTML ELEMENTS
// ==========================================

const hero = document.querySelector(".hero");

const startButton = document.querySelector(
    "#startBtn, #startConstruction, .nav-button"
);

const calculateButton = document.querySelector(
    ".calculate-button"
);

const downloadButton = document.querySelector(
    ".download-button"
);

const totalElement = document.querySelector(
    "#totalBudget, #estimateTotal, .total-card h2"
);

const breakdownContainer = document.querySelector(
    ".breakdown"
);

const toast = document.querySelector(".toast");

let currentEstimate = null;
let toastTimer = null;

// ==========================================
// 2. HERO BACKGROUND IMAGE SLIDER
// ==========================================

const heroImages = [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85",

    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=85",

    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2200&q=85",

    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=2200&q=85"
];

const sliderDots = Array.from(
    document.querySelectorAll(".slider-dot")
);

let currentSlide = 0;
let sliderTimer;

function showSlide(index) {
    if (!hero) return;

    currentSlide =
        (index + heroImages.length) % heroImages.length;

    hero.style.setProperty(
        "--hero-image",
        `url("${heroImages[currentSlide]}")`
    );

    sliderDots.forEach((dot, i) => {
        dot.classList.toggle(
            "active",
            i === currentSlide
        );

        dot.setAttribute(
            "aria-pressed",
            String(i === currentSlide)
        );
    });
}

function startSlider() {
    clearInterval(sliderTimer);

    sliderTimer = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 6000);
}

sliderDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        showSlide(index);
        startSlider();
    });
});

if (hero) {
    showSlide(0);
    startSlider();
}

// ==========================================
// 3. TOAST NOTIFICATION
// ==========================================

function showToast(message) {
    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ==========================================
// 4. NAVIGATION
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);

        if (target) {
            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

if (startButton) {
    startButton.addEventListener("click", () => {
        const planner = document.querySelector(
            "#planner, #plannerSection, .planner-section"
        );

        if (planner) {
            planner.scrollIntoView({
                behavior: "smooth"
            });

            showToast(
                "Let's plan your dream home!"
            );
        }
    });
}

// ==========================================
// 5. SCROLL REVEAL ANIMATIONS
// ==========================================

const revealElements = document.querySelectorAll(
    ".feature-card, .awareness-card, .step-card, .panel, .section-heading"
);

revealElements.forEach(element => {
    element.classList.add("reveal");
});

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    revealElements.forEach(element => {
        observer.observe(element);
    });
} else {
    revealElements.forEach(element => {
        element.classList.add("visible");
    });
}

// ==========================================
// 6. READ INPUTS
// ==========================================

function findInput(possibleSelectors) {
    for (const selector of possibleSelectors) {
        const element = document.querySelector(selector);

        if (element) return element;
    }

    return null;
}

const lengthInput = findInput([
    "#length",
    "#plotLength",
    '[name="length"]',
    '[name="plotLength"]'
]);

const widthInput = findInput([
    "#width",
    "#plotWidth",
    '[name="width"]',
    '[name="plotWidth"]'
]);

const floorsInput = findInput([
    "#floors",
    '[name="floors"]'
]);

const bedroomsInput = findInput([
    "#bedrooms",
    '[name="bedrooms"]'
]);

const bathroomsInput = findInput([
    "#bathrooms",
    '[name="bathrooms"]'
]);

const qualityInput = findInput([
    "#quality",
    "#qualityTier",
    '[name="quality"]'
]);

const rateInput = findInput([
    "#rate",
    '[name="rate"]'
]);

// ==========================================
// 7. CONSTRUCTION BUDGET CALCULATOR
// ==========================================

const qualityRates = {
    less: 1500,
    moderate: 2000,
    luxury: 3000
};

const costCategories = [
    {
        name: "Structure",
        percentage: 35,
        color: "#8067ff"
    },
    {
        name: "Materials",
        percentage: 25,
        color: "#4d8dff"
    },
    {
        name: "Labour",
        percentage: 20,
        color: "#20c6b7"
    },
    {
        name: "Finishing",
        percentage: 20,
        color: "#ff963f"
    }
];

function getNumber(input, fallback = 0) {
    if (!input) return fallback;

    const value = Number(input.value);

    return Number.isFinite(value)
        ? value
        : fallback;
}

function formatRupees(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}

function getQualityRate() {
    if (rateInput && rateInput.value !== "") {
        const customRate = Number(rateInput.value);

        if (
            Number.isFinite(customRate) &&
            customRate > 0
        ) {
            return customRate;
        }
    }

    const quality = (
        qualityInput?.value || "moderate"
    ).toLowerCase();

    return qualityRates[quality] || qualityRates.moderate;
}

function buildBreakdown(total) {
    if (!breakdownContainer) return;

    breakdownContainer.innerHTML = "";

    costCategories.forEach(category => {
        const amount =
            total * category.percentage / 100;

        const row = document.createElement("div");
        row.className = "break-row";

        const label = document.createElement("span");
        label.textContent = category.name;

        const bar = document.createElement("div");
        bar.className = "bar";

        const barFill = document.createElement("span");
        barFill.style.backgroundColor = category.color;
        barFill.style.width = "0%";

        bar.appendChild(barFill);

        const value = document.createElement("strong");
        value.textContent = formatRupees(amount);

        row.append(label, bar, value);
        breakdownContainer.appendChild(row);

        requestAnimationFrame(() => {
            barFill.style.width =
                category.percentage + "%";
        });
    });
}

function calculateBudget() {
    const length = getNumber(lengthInput);
    const width = getNumber(widthInput);
    const floors = Math.max(
        1,
        getNumber(floorsInput, 1)
    );

    if (length <= 0 || width <= 0) {
        showToast(
            "Please enter valid plot length and width."
        );

        lengthInput?.focus();
        return;
    }

    if (length > 10000 || width > 10000) {
        showToast(
            "Please check the plot dimensions."
        );
        return;
    }

    const plotArea = length * width;

    // Assumption: 70% of plot area is constructed
    const builtArea =
        plotArea * 0.70 * floors;

    const rate = getQualityRate();

    // Base construction estimate
    const baseCost = builtArea * rate;

    // Add 10% contingency allowance
    const contingency = baseCost * 0.10;

    const total = baseCost + contingency;

    currentEstimate = {
        length,
        width,
        floors,
        plotArea,
        builtArea,
        rate,
        baseCost,
        contingency,
        total,
        quality: qualityInput?.value || "moderate",
        bedrooms: getNumber(bedroomsInput, 0),
        bathrooms: getNumber(bathroomsInput, 0),
        date: new Date().toLocaleDateString("en-IN")
    };

    if (totalElement) {
        totalElement.textContent =
            formatRupees(total);
    }

    const areaElement = document.querySelector(
        "#builtArea, #areaValue, .stat-card:nth-child(1) strong"
    );

    if (areaElement) {
        areaElement.textContent =
            builtArea.toLocaleString("en-IN") +
            " sq ft";
    }

    const rateElement = document.querySelector(
        "#rateValue, .stat-card:nth-child(2) strong"
    );

    if (rateElement) {
        rateElement.textContent =
            formatRupees(rate) + "/sq ft";
    }

    const floorsElement = document.querySelector(
        "#floorsValue, .stat-card:nth-child(3) strong"
    );

    if (floorsElement) {
        floorsElement.textContent =
            String(floors);
    }

    buildBreakdown(total);

    const notice = document.querySelector(
        ".notice"
    );

    if (notice) {
        notice.textContent =
            "This is an approximate planning estimate using " +
            formatRupees(rate) +
            " per sq ft and a 10% contingency allowance. " +
            "Actual costs depend on location, design, materials, " +
            "labour, approvals and site conditions.";
    }

    const dashboard = document.querySelector(
        ".dashboard"
    );

    dashboard?.classList.remove(
        "calculation-success"
    );

    if (dashboard) {
        void dashboard.offsetWidth;

        dashboard.classList.add(
            "calculation-success"
        );
    }

    showToast(
        "Budget estimate calculated successfully!"
    );
}

if (calculateButton) {
    calculateButton.addEventListener(
        "click",
        calculateBudget
    );
}

// ==========================================
// 8. PIE CHART
// ==========================================

function drawPieChart() {
    const pieChart = document.querySelector(
        "#pieChart, .pie-chart"
    );

    if (!pieChart) return;

    let currentPercentage = 0;

    const segments = costCategories.map(category => {
        const start = currentPercentage;

        currentPercentage += category.percentage;

        return `${category.color} ${start}% ${currentPercentage}%`;
    });

    pieChart.style.background =
        `conic-gradient(${segments.join(", ")})`;

    pieChart.style.borderRadius = "50%";

    pieChart.setAttribute(
        "aria-label",
        "Estimated construction cost breakdown"
    );

    const legend = document.querySelector(
        "#chartLegend, .chart-legend"
    );

    if (legend) {
        legend.innerHTML = "";

        costCategories.forEach(category => {
            const item = document.createElement("div");

            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.gap = "8px";
            item.style.marginBottom = "8px";

            const marker = document.createElement("span");

            marker.style.width = "12px";
            marker.style.height = "12px";
            marker.style.borderRadius = "3px";
            marker.style.backgroundColor = category.color;

            const label = document.createElement("span");

            label.textContent =
                `${category.name} — ${category.percentage}%`;

            item.append(marker, label);
            legend.appendChild(item);
        });
    }
}

drawPieChart();

// ==========================================
// 9. DOWNLOAD ESTIMATE AS TEXT FILE
// ==========================================

function downloadEstimate() {
    if (!currentEstimate) {
        showToast(
            "Calculate the budget before downloading."
        );
        return;
    }

    const data = currentEstimate;

    const report = [
        "BUILDER PRO — CONSTRUCTION ESTIMATE",
        "====================================",
        "",
        `Date: ${data.date}`,
        `Plot dimensions: ${data.length} x ${data.width} ft`,
        `Plot area: ${data.plotArea.toLocaleString("en-IN")} sq ft`,
        `Estimated built-up area: ${data.builtArea.toLocaleString("en-IN")} sq ft`,
        `Floors: ${data.floors}`,
        `Bedrooms: ${data.bedrooms || "Not specified"}`,
        `Bathrooms: ${data.bathrooms || "Not specified"}`,
        `Quality tier: ${data.quality}`,
        `Estimated rate: ${formatRupees(data.rate)} per sq ft`,
        "",
        `Base construction cost: ${formatRupees(data.baseCost)}`,
        `Contingency allowance (10%): ${formatRupees(data.contingency)}`,
        `TOTAL ESTIMATED BUDGET: ${formatRupees(data.total)}`,
        "",
        "Estimated cost allocation:",
        ...costCategories.map(category =>
            `${category.name}: ${category.percentage}%`
        ),
        "",
        "DISCLAIMER:",
        "This is an illustrative estimate, not a contractor quotation.",
        "Rates are fixed example values and are not live market prices.",
        "Actual costs may vary by location, design, materials and labour."
    ].join("\n");

    const blob = new Blob(
        [report],
        { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Builder-Pro-Estimate.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

    showToast("Estimate downloaded!");
}

if (downloadButton) {
    downloadButton.addEventListener(
        "click",
        downloadEstimate
    );
}

// ==========================================
// 10. ENTER KEY SUPPORT
// ==========================================

[
    lengthInput,
    widthInput,
    floorsInput,
    bedroomsInput,
    bathroomsInput,
    qualityInput,
    rateInput
].filter(Boolean).forEach(input => {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();

            if (calculateButton) {
                calculateButton.click();
            }
        }
    });
});

// ==========================================
// 11. CHATBOT DEMO
// ==========================================

const chatToggle = document.querySelector(
    "#chatFab, #chatToggle, .chat-fab"
);

const chatPanel = document.querySelector(
    "#chatPanel, .chat-panel"
);

const chatForm = document.querySelector(
    "#chatForm, .chat-form"
);

const chatInput = document.querySelector(
    "#chatInput, #messageInput, #chatForm input"
);

const chatMessages = document.querySelector(
    "#chatMessages, .chat-messages"
);

if (chatToggle && chatPanel) {
    chatToggle.addEventListener("click", () => {
        const isOpen =
            chatPanel.classList.toggle("open");

        chatPanel.style.display =
            isOpen ? "block" : "none";

        chatToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        if (isOpen) {
            chatInput?.focus();
        }
    });
}

function addChatMessage(text, sender) {
    if (!chatMessages) {
        showToast(text);
        return;
    }

    const message = document.createElement("div");

    message.className =
        sender === "user"
            ? "chat-message user-message"
            : "chat-message bot-message";

    message.textContent = text;

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}

function getBotReply(message) {
    const text = message.toLowerCase();

    if (
        text.includes("budget") ||
        text.includes("cost") ||
        text.includes("price")
    ) {
        return currentEstimate
            ? `Your current estimated budget is ${formatRupees(currentEstimate.total)}. This is an illustrative estimate, not a live market quotation.`
            : "Enter your plot dimensions and calculate an estimate to get a budget.";
    }

    if (
        text.includes("material") ||
        text.includes("cement") ||
        text.includes("steel")
    ) {
        return "Cement, steel, sand, aggregates and bricks are common construction materials. Their prices depend on location, brand and quantity.";
    }

    if (
        text.includes("plan") ||
        text.includes("design")
    ) {
        return "Choose a house layout based on your plot size, number of floors, bedrooms and ventilation requirements.";
    }

    if (
        text.includes("hello") ||
        text.includes("hi")
    ) {
        return "Hello! I'm Builder Pro's demo assistant. Ask me about house plans, materials or construction budgets.";
    }

    return "I can help with basic questions about construction budgets, materials and house planning. This is a demo chatbot, not a live AI service.";
}

if (chatForm) {
    chatForm.addEventListener("submit", event => {
        event.preventDefault();

        const message = chatInput?.value.trim();

        if (!message) return;

        addChatMessage(message, "user");

        if (chatInput) {
            chatInput.value = "";
        }

        setTimeout(() => {
            addChatMessage(
                getBotReply(message),
                "bot"
            );
        }, 350);
    });
}

console.log(
    "Builder Pro initialized successfully."
);
});
const generateBtn = document.getElementById("generateBtn");

if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
        const houseType = document.getElementById("houseType").value;
        const style = document.getElementById("houseStyle").value;
        const color = document.getElementById("houseColor").value;

        const status = document.getElementById("aiStatus");
        const result = document.getElementById("aiResult");

        generateBtn.disabled = true;
        status.textContent = "Generating your dream house... Please wait!";
        result.replaceChildren();

        try {
            const response = await fetch("http://localhost:3000/generate-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ houseType, style, color })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Image generation failed.");
            }

            const image = document.createElement("img");
            image.src = `data:image/png;base64,${data.image}`;
            image.alt = "AI-generated house design";
            image.style.width = "100%";
            image.style.maxWidth = "700px";
            image.style.borderRadius = "16px";

            result.appendChild(image);
            status.textContent = "Your AI house design is ready! 🎉";
        } catch (error) {
            status.textContent = error.message;
            console.error(error);
        } finally {
            generateBtn.disabled = false;
        }
    });
}const districtsByState = {
    "Andhra Pradesh": [
        "Alluri Sitharama Raju", "Anakapalli", "Anantapur",
        "Annamayya", "Bapatla", "Chittoor", "Dr. B.R. Ambedkar Konaseema",
        "East Godavari", "Eluru", "Guntur", "Kakinada",
        "Krishna", "Kurnool", "Nandyal", "NTR",
        "Palnadu", "Parvathipuram Manyam", "Prakasam",
        "Srikakulam", "Sri Potti Sriramulu Nellore",
        "Sri Sathya Sai", "Tirupati", "Visakhapatnam",
        "Vizianagaram", "West Godavari", "YSR Kadapa"
    ],
    "Telangana": [
        "Adilabad", "Bhadradri Kothagudem", "Hanumakonda",
        "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally",
        "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
        "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad",
        "Mahabubnagar", "Mancherial", "Medak",
        "Medchal–Malkajgiri", "Mulugu", "Nagarkurnool",
        "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad",
        "Peddapalli", "Rajanna Sircilla", "Rangareddy",
        "Sangareddy", "Siddipet", "Suryapet",
        "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
    ],
    "Karnataka": [
        "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural",
        "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur",
        "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
        "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
        "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya",
        "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
        "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara",
        "Vijayapura", "Yadgir"
    ],
    "Tamil Nadu": [
        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore",
        "Cuddalore", "Dharmapuri", "Dindigul", "Erode",
        "Kallakurichi", "Kancheepuram", "Kanniyakumari",
        "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
        "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur",
        "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem",
        "Sivaganga", "Tenkasi", "Thanjavur", "Theni",
        "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
        "Tirupathur", "Tiruppur", "Tiruvallur",
        "Tiruvannamalai", "Tiruvarur", "Vellore",
        "Viluppuram", "Virudhunagar"
    ],
    "Maharashtra": [
        "Ahmednagar", "Akola", "Amravati", "Beed", "Bhandara",
        "Buldhana", "Chandrapur", "Chhatrapati Sambhajinagar",
        "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon",
        "Jalna", "Kolhapur", "Latur", "Mumbai City",
        "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar",
        "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune",
        "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg",
        "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
    ],
    "Delhi": [
        "Central Delhi", "East Delhi", "New Delhi", "North Delhi",
        "North East Delhi", "North West Delhi", "Shahdara",
        "South Delhi", "South East Delhi", "South West Delhi",
        "West Delhi"
    ],
    "Other": ["Other / Not listed"]
};

const statesAndUTs = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep",
    "Delhi", "Puducherry"
];

const stateSelect = document.getElementById("state");
const districtSelect = document.getElementById("district");

if (stateSelect && districtSelect) {
    statesAndUTs.forEach(state => {
        const option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });

    stateSelect.addEventListener("change", () => {
        const state = stateSelect.value;

        districtSelect.replaceChildren();

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = state
            ? "Select district"
            : "Select state first";

        districtSelect.appendChild(placeholder);

        const districts = districtsByState[state];

        if (districts) {
            districts.forEach(district => {
                const option = document.createElement("option");
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });

            districtSelect.disabled = false;
        } else {
            districtSelect.disabled = true;

            if (state) {
                placeholder.textContent =
                    "District list not available — enter city below";
            }
        }
    });
}
function startConstruction() {
    document.getElementById("homeInterface").style.display = "none";

    document.getElementById("constructionInterface").style.display = "block";
}

function goBack() {
    document.getElementById("constructionInterface").style.display = "none";

    document.getElementById("homeInterface").style.display = "block";
}