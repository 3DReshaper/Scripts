
function CreateScriptPicture(PathName)
{
	var picError = CreatePicture(
		PathName, // [in] image file name 
		500, // [in] number of pixels height. If <0, this number is adjusted to insure the picture is no too
		// large for photo editor
		500, // [in] number of pixels width. If <0, this number is adjusted to insure the picture is no too
		// large for photo editor
		1, // [in] Should we fit the 3D view on image size ?
		// 0	No, same proportion as on screen
		// 1	Yes, adjust to fit the image
		1, // [in] Background type
		// 0	Same background as on screen
		// 1	Always white.
		0, // [in] Text height coef multiplication factor
		// 0	Same as on screen
		// <1	Smaller.
		// >1	Greater
		2 // [in] image format
		// 0	Bitmap
		// 1	Jpeg
		// 2	Png
	).ErrorCode;

	if (picError != 0)
		throw new Error('An error occured in the create picture function.');
}
