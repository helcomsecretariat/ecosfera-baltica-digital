# Ecosfera Baltica Digital

Ecosfera Baltica Digital is a digital adaptation of the original [Ecosfera](https://www.julibert.com/ecosfera) game made by Julibert games. Ecosfera Baltica is also a remix of the original game with more Baltic Sea related themes.

## Technologies Used

- React + TypeScript + Tailwind
- XSatate for state management
- React Three Fiber + Framer Motion for smooth animations
- Netlify for CI/CD

## Development

1. Install [`nvm`](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script)

2. Install [`pre-commit`](https://pre-commit.com/#install)

3. Configure git hooks. **Please don't skip** our hooks only test for secrets being leaked. Takes few milliseconds.

   ```shell
   pre-commit install
   ```

4. Run the dev server:

   ```shell
   npm run dev
   ```

## CI/CD

We use [Netlify](https://app.netlify.com/sites/ecosfera) to deploy the project. To access Netlify account ask [@i-j-r](https://github.com/i-j-r) for details.

### Deploy to production

Just update `prod` branch. Netlify will build and deploy it to https://ecosfera.netlify.app/ (and https://ecosferabaltica.helcom.fi/).

## License

This project is developed under a GPL-3.0 License. See the [LICENSE](https://github.com/helcomsecretariat/ecosfera-baltica-digital?tab=GPL-3.0-1-ov-file) file for more details.
