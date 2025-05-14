# EA Street Motoshop POS

## Deployment

Follow these steps to get the project up and running:

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    ```

    Replace `<repository_url>` with the actual URL of your project's Git repository.

2.  **Navigate to the project directory and install dependencies:**

    ```bash
    cd your-project-name
    pnpm i
    ```

    This command uses `pnpm` to install all the necessary packages defined in the `package.json` file. Make sure you have `pnpm` installed globally on your system. If not, you can install it using `npm install -g pnpm`.

3.  **Create a `.env` file and configure environment variables:**

    In the root of your project directory, create a new file named `.env`. Inside this file, add the following environment variable, replacing `<database key>` with your actual database connection string:

    ```
    DATABASE_URL = '<database key>'
    ```

    **Important:** Ensure that this `.env` file is not committed to your version control system for security reasons. It typically contains sensitive information.

4.  **Start the development server:**

    ```bash
    pnpm run dev
    ```

    This command will execute the development script defined in your `package.json` file, usually starting a local development server. You should see output in your terminal indicating the server has started and the address it's running on (e.g., `http://localhost:3000`).
