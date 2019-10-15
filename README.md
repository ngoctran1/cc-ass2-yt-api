# YouTube Trending Videos API

## About
API backend for use with YouTube Trending Videos Map. Retrieves, stores, and tracks details of trending videos from regions across the globe.

## Google Cloud Deployment Instructions
Before starting, ensure that you have a Google account and have created a billing account for the Google Cloud services. Also ensure that you have the [Google Cloud SDK](https://cloud.google.com/sdk/) installed on your computer.

### Create New Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new Google Cloud project.
3. Keep note of the project-id for this new project.

### Initialise App Engine
1. Go to the [App Engine](https://console.cloud.google.com/appengine) dashboard.
     - Navigation menu -> App Engine
2. Create a new App Engine app.
     - We will be deploying an app using the Flexible environment, so make sure you have connected a billing account.
     
### Enable YouTube Data API and setup API Key
1. Go to the [API](https://console.cloud.google.com/apis) dashboard.
     - Navigation Menu -> API & Services
2. Click on **Enable APIs and Services**.
3. Search for and enable the **YouTube Data API**.
4. Go to the [API credentials](https://console.cloud.google.com/apis/credentials) page.
     - Navigation Menu -> API & Service -> Credentials
5. Click on **Create Credentials** drop down menu and then **API Key**.
6. Keep note of the API Key generated.

### Initialise SQL Database
1. Go to the [SQL Storage](https://console.cloud.google.com/sql) page.
    - Navigation Menu -> SQL
2. Create a new instance (may take a while).
3. Click on this new instance in the instances list.
4. Click on the **Users** tab and create a new user for the project.
    - Keep track of the user name and password.
5. Click on the **Databases** tab and create a new database.
    - Keep track of the database name.
    
### Setup and Deploy YouTube Trending Videos API
1. Clone this repo.
    - In a terminal (Unix) or Git Bash (Windows): `git clone https://github.com/s3688394/cc-ass2-yt-api.git`
2. Navigate to the **cc-ass2-yt-api** folder.
3. Copy every file ending in `.example` and rename them withoout the `.example`. There are three such files:
    - `.env_example` -> `.env`
    - `app.yaml.example` -> `app.yaml`
    - `openapi-appengine.yaml.example` -> `openapi-appengine.yaml`
4. In the two `.yaml` files, replace `<GCLOUD PROJECT ID>` with your project-id from step 3 of the **Create New Google Cloud Project** section above.
5. In the `.env` file:
    - Replace `<YOUTUBE API KEY>` with your API key from step 6 of the **Enable YouTube Data API and setup API Key** setion above.
    - Replace `<USER>` and `<USER PASSWORD>` with those from step 4 and `<DATABASE NAME>` with that from step 5 of the **Initialise SQL Database** section above.
6. Deploy Google Cloud Endpoints configuration by running the following in a terminal:
    - `gcloud endpoints services deploy openapi-appengine.yaml`
7. Deploy the project to App Engine by running the following in a terminal:
    - `gcloud app deploy`

The API is now deployed. The link your API is accessed from can be found by going to the [Google Cloud Endpoints](https://console.cloud.google.com/endpoints) page and looking at **Service Name**. The available methods can be found in the **Method** section at the bottom of that page.

