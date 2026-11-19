# Truck routing and freight assessments

| Item | Location |
| --- | --- |
| Public routing application | https://roadwise-truck-route-desk.qazsarmad.chatgpt.site/ |
| Five-minute routing API walkthrough | https://roadwise-truck-route-desk.qazsarmad.chatgpt.site/walkthrough.mp4 |
| Django API, React UI and run instructions | [roadwise/README.md](roadwise/README.md) |
| Postman collection | [Roadwise collection](roadwise/postman/Roadwise.postman_collection.json) |
| Model, method and reproducibility instructions | [freight/README.md](freight/README.md) |
| Final predictions | [validation_predictions.csv](freight/validation_predictions.csv) |
| December estimates | [december_predictions.csv](freight/december_predictions.csv) |
| Report with December chart | [freight_rate_report.pdf](freight/freight_rate_report.pdf) |

The public site runs the Python planner in the browser. The separate Django server serves the REST endpoints used in the Postman demonstration. After pushing this project to a Git repository, the root Render blueprint describes a free Docker web service with a health check for the Django deployment. Render supplies its service hostname. To run locally, follow the routing README.

The freight scorer validated 12,000 final predictions and 31 fixed December predictions. The September–October development holdout mean absolute error was $106.21 per load. The evaluator holds the final labels.
