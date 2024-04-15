async function postData(event)
{
    event.preventDefault();
    const formData = { number: document.getElementById('number').value, avg_weight: document.getElementById('avg_weight').value,};
    const url = '/matsvinn_calc_post';

    try
    {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok)
        {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        
        const responseData = await response.json();
        const resultElement = document.getElementById('result');
        resultElement.classList.add('font-weight-bold', 'text-warning');
        resultElement.textContent = responseData.result; // Display the result
        
        const messageElement = document.getElementById('message');
        messageElement.textContent = responseData.message; // Display the message
        
    } catch (error) { console.error('Error:', error); }
}

document.addEventListener('DOMContentLoaded', function()
{
    const form = document.getElementById('matsvinnForm');
    form.addEventListener('submit', postData);
});