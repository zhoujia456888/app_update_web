type ErrorResponseData = {
	msg?: string;
};

type ErrorResponse = {
	data?: ErrorResponseData;
};

type HttpErrorLike = {
	message?: string;
	response?: ErrorResponse;
};

export function getHttpErrorMessage(
	error: unknown,
	fallbackMessage: string,
): string {
	const message = (error as HttpErrorLike).response?.data?.msg;

	if (typeof message === "string" && message.trim()) {
		return message;
	}

	const genericMessage = (error as HttpErrorLike).message;
	if (typeof genericMessage === "string" && genericMessage.trim()) {
		return genericMessage;
	}

	return fallbackMessage;
}
