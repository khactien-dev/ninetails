# read the workflow template
WORKFLOW_TEMPLATE=$(cat .github/workflow-template.yml)

# iterate each route in routes directory
for APP in $(ls apps); do
    echo "generating workflow for apps/${APP}"

    # replace template route placeholder with route name
    WORKFLOW=$(echo "${WORKFLOW_TEMPLATE}" | sed "s/{{APP}}/${APP}/g")

    # save workflow to .github/workflows/{APP}
    echo "${WORKFLOW}" > .github/workflows/${APP}.yml
done