const sendWebhookNotification = async (action, data) => {
	try {
		const response = await fetch('/api/webhook', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ action, data })
		});

		if (!response.ok) {
			return false;
		}

		const result = await response.json();
		return result.success;
	} catch (error) {
		return false;
	}
};

export { sendWebhookNotification };
