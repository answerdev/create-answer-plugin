#! /usr/bin/env node

const prompts = require('prompts');

const selectPluginTYpe = [
    {
        type: 'select',
        name: 'pluginType',
        message: 'What type of plugin do you want to create?',
        choices: [
            { title: 'Backend Plugin', value: 'backend' },
            { title: 'Frontend Plugin', value: 'frontend' },
            { title: "Standard Plugin", value: 'standard' }
        ]
    }
];

(async () => {
    const { pluginType } = await prompts(selectPluginTYpe);
    console.log(pluginType);
}
)();