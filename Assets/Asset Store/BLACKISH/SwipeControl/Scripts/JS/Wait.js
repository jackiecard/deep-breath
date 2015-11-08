
static function WaitForSecRealtime (sec : float) {

	var waitTime : float = Time.realtimeSinceStartup + sec;
	while (Time.realtimeSinceStartup < waitTime) {
		// we are waiting...
		yield;
	}

}