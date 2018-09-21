
/// @brief
/// To discretize a CAD object of the document in an SPoly
/// @retval Array.? the CAD object (it can be an SCompound, an SFace, or an SShell)
function CADFromName(Name)
{
	var result;
	
	result = SCADSurface.FromName( Name );
	if ( result.length > 1 ) // Check for import success
		throw new Error('there is more than one object named: ' + Name);
	if ( result.length == 1 ) // Check for import success
		return result[0];
	
	throw new Error('Impossible to discretize the CAD object named: ' + Name);
}

/// @brief
/// To discretize a CAD object of the document in an SPoly
/// @retval Array.Poly the CAD object discretized, else an exception is thrown
function GetPoly_CADFromName(Name)
{
	var CADDiscretization = CADFromName(Name).Discretize();
	if (CADDiscretization.ErrorCode != 0)
		throw new Error('Impossible to discretize this CAD object.');

	var compoundPoly = SPoly.CreateCompound(
		CADDiscretization.PolyTbl, // [in, out] Table of SPoly to proceed.
		// All the mesh are empty when returning from this function.
		0 // [in] Should we to orient all the parts to have the same normal orientation ?
		// 0	(default) No
		// 1	Yes
		);
	if (compoundPoly.ErrorCode != 0)
		throw new Error('Impossible to create a compound SPoly.');
		
	return compoundPoly.Poly;
}

function GetMulti_FromName(Name)
{
	var result = SMultiline.FromName( Name );
	if ( result.length > 1 ) // Check for import success
		throw new Error('there is more than one object named: ' + Name);
	if ( result.length == 1 ) // Check for import success
		return result[0];
	throw new Error('No multiline named: ' + Name);
}

