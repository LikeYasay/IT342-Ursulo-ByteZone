# ByteZone Android Google Sign-In Setup

The mobile app requests a Google ID token and sends it to `POST /api/auth/google` as:

```json
{
  "googleIdToken": "<ID_TOKEN>"
}
```

Required Google Cloud setup:

- Android OAuth Client
- Package name: `edu.cit.ursulo.bytezone`
- Debug and release SHA-1 fingerprints
- Debug and release SHA-256 fingerprints
- Web Client ID stored in `app/src/main/res/values/strings.xml` as `google_server_client_id`
- Render backend `GOOGLE_CLIENT_ID` must match that same Web Client ID

Do not place private secrets in the Android app. The Web Client ID is public configuration used as the ID-token audience.
