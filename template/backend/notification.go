/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package {{package_name}}

import (
	"context"
	"embed"
	"fmt"
	"github.com/apache/answer-plugins/{{plugin_name}}/i18n"
	"github.com/apache/answer-plugins/util"
	"github.com/apache/answer/plugin"
)

//go:embed info.yaml
var Info embed.FS

type {{plugin_display_name}} struct {
	Config *{{plugin_display_name}}Config
}

type {{plugin_display_name}}Config struct {
	WebhookURL string `json:"webhook_url"`
	APIKey     string `json:"api_key"`
}

func init() {
	plugin.Register(&{{plugin_display_name}}{
		Config: &{{plugin_display_name}}Config{},
	})
}

func (n *{{plugin_display_name}}) Info() plugin.Info {
	info := &util.Info{}
	info.GetInfo(Info)

	return plugin.Info{
		Name:        plugin.MakeTranslator(i18n.InfoName),
		SlugName:    info.SlugName,
		Description: plugin.MakeTranslator(i18n.InfoDescription),
		Author:      info.Author,
		Version:     info.Version,
		Link:        info.Link,
	}
}

func (n *{{plugin_display_name}}) Notify(ctx context.Context, msg plugin.NotificationMessage) error {
	// TODO: Implement notification sending logic
	// This is a Hello World example - implement your notification logic here
	fmt.Printf("Notification: Sending message to %s (type: %s)\n",
		msg.ReceiverUserID, msg.Type)
	return nil
}

