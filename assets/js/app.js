const API_URL = 'https://rtuber1231.pythonanywhere.com/scrapper';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scraperForm');
    const tabs = document.querySelectorAll('.tabs button');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelector('.tabs .active').classList.remove('active');
            e.target.classList.add('active');
            showForm(e.target.dataset.type);
        });
    });

    form.addEventListener('submit', handleSubmit);
    showForm('jobs');
});

function showForm(type) {
    document.querySelectorAll('.form-group').forEach(el => el.classList.add('hidden'));
    document.querySelector(`.${type}`).classList.remove('hidden');
}

async function handleSubmit(e) {
    e.preventDefault();
    clearMessages();
    const type = document.querySelector('.tabs .active').dataset.type;
    
    if (!validateForm(type)) return;
    
    showLoading(true);
    
    try {
        const payload = buildPayload(type);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Scraping failed');
        }

        displayResults(data.data, type);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

function buildPayload(type) {
    const payload = { type };
    
    if (type === 'jobs') {
        return {
            ...payload,
            url: document.getElementById('jobsUrl').value,
            container_selector: document.getElementById('containerSel').value,
            selectors: {
                title: document.getElementById('titleSel').value,
                company: document.getElementById('companySel').value
            }
        };
    }
    
    if (type === 'stock') {
        return {
            ...payload,
            symbol: document.getElementById('stockSymbol').value
        };
    }
}

function validateForm(type) {
    let isValid = true;
    const errorMessages = [];
    
    if (type === 'jobs') {
        if (!document.getElementById('jobsUrl').value) {
            errorMessages.push('URL is required');
            isValid = false;
        }
        if (!document.getElementById('containerSel').value) {
            errorMessages.push('Container selector is required');
            isValid = false;
        }
    }
    
    if (errorMessages.length > 0) {
        showError(errorMessages.join('<br>'));
    }
    
    return isValid;
}

function displayResults(data, type) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    if (type === 'stock') {
        resultsDiv.innerHTML = `
            <div class="result-card">
                <h3>${data.symbol}</h3>
                <p>Price: ${data.price}</p>
                <p>Currency: ${data.currency}</p>
                <p>Last Updated: ${data.timestamp}</p>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = data.map(item => `
            <div class="result-card">
                ${Object.entries(item).map(([key, value]) => `
                    <p><strong>${key}:</strong> ${value || 'N/A'}</p>
                `).join('')}
            </div>
        `).join('');
    }
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = `${message} <button onclick="this.parentElement.style.display='none'">×</button>`;
    errorDiv.style.display = 'block';
}

function clearMessages() {
    document.getElementById('error').style.display = 'none';
}
