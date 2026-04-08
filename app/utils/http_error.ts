type ErrorResponseData = {
	msg?: string;
};

type ErrorResponse = {
	data?: ErrorResponseData;
};

type HttpErrorLike = {
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

	return fallbackMessage;
}
