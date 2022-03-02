export const instanceWarning = `
<div class="warning">
<h1>Warning!</h1>
<h2>It appears that Serifu is already running in another browser window.</h2>

<p>Only one instance of Serifu may be open at once, so you should probably close this window and go back to the other one.</p>

<p>It's possible you're receiving this message in error. For example, if your browser crashed while Serifu was open, Serifu might think there's another instance running when there isn't.</p>

<p>If you suspect that's the case, then after making <em>absolutely, utterly positive</em> that Serifu is not open in another window, you should override this error message and proceed. However, <em>please be certain</em>—running multiple open instances of Serifu could lead to corruption of your save slots.</p>

<p><button id="override" onClick="localStorage.removeItem('instance-mutex'); location.reload();">Override this warning and continue</button>
</div>
`;
