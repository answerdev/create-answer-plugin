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
	"embed"
	"fmt"
	"github.com/apache/answer-plugins/{{plugin_name}}/i18n"
	"github.com/apache/answer-plugins/util"
	"github.com/apache/answer/plugin"
	"github.com/gin-gonic/gin"
)

//go:embed info.yaml
var Info embed.FS

type {{plugin_display_name}} struct {
	Config *{{plugin_display_name}}Config
}

type {{plugin_display_name}}Config struct {
	Endpoint string `json:"endpoint"`
	APIKey   string `json:"api_key"`
}

func init() {
	plugin.Register(&{{plugin_display_name}}{
		Config: &{{plugin_display_name}}Config{},
	})
}

func (u *{{plugin_display_name}}) Info() plugin.Info {
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

func (uc *{{plugin_display_name}}) LoginCallback(ctx *plugin.GinContext) (userInfo *plugin.UserCenterBasicUserInfo, err error) {
	// TODO: Implement login callback logic
	// This is a Hello World example - implement your user center logic here
	fmt.Printf("UserCenter: Login callback\n")
	return &plugin.UserCenterBasicUserInfo{
		ExternalID:  "hello-world-user-id",
		DisplayName: "Hello World User",
		Username:    "helloworld",
		Email:       "hello@example.com",
		Avatar:      "",
	}, nil
}

func (uc *{{plugin_display_name}}) SignUpCallback(ctx *plugin.GinContext) (userInfo *plugin.UserCenterBasicUserInfo, err error) {
	// TODO: Implement sign up callback logic
	// This is a Hello World example - implement your user center logic here
	fmt.Printf("UserCenter: Sign up callback\n")
	return &plugin.UserCenterBasicUserInfo{
		ExternalID:  "hello-world-new-user-id",
		DisplayName: "Hello World New User",
		Username:    "newuser",
		Email:       "newuser@example.com",
		Avatar:      "",
	}, nil
}

func (uc *{{plugin_display_name}}) UserInfo(externalID string) (userInfo *plugin.UserCenterBasicUserInfo, err error) {
	// TODO: Implement user info retrieval logic
	// This is a Hello World example - implement your user center logic here
	fmt.Printf("UserCenter: Get user info for externalID: %s\n", externalID)
	return &plugin.UserCenterBasicUserInfo{
		ExternalID:  externalID,
		DisplayName: "Hello World User",
		Username:    "helloworld",
		Email:       "hello@example.com",
		Avatar:      "",
	}, nil
}

func (uc *{{plugin_display_name}}) UserList(externalIDs []string) (userList []*plugin.UserCenterBasicUserInfo, err error) {
	// TODO: Implement user list retrieval logic
	// This is a Hello World example - implement your user center logic here
	fmt.Printf("UserCenter: Get user list for %d users\n", len(externalIDs))
	return []*plugin.UserCenterBasicUserInfo{}, nil
}

func (uc *{{plugin_display_name}}) UserStatus(externalID string) (userStatus plugin.UserStatus) {
	// TODO: Implement user status check logic
	// This is a Hello World example - implement your user center logic here
	return plugin.UserStatusAvailable
}

func (uc *{{plugin_display_name}}) AfterLogin(externalID, accessToken string) {
	// TODO: Implement after login logic
	// This is a Hello World example - implement your user center logic here
	fmt.Printf("UserCenter: After login for externalID: %s\n", externalID)
}

func (uc *{{plugin_display_name}}) RegisterUnAuthRouter(r *gin.RouterGroup) {
	// TODO: Register unauthenticated routes
	// This is a Hello World example - implement your routes here
}

func (uc *{{plugin_display_name}}) RegisterAuthUserRouter(r *gin.RouterGroup) {
	// TODO: Register authenticated user routes
	// This is a Hello World example - implement your routes here
}

func (uc *{{plugin_display_name}}) RegisterAuthAdminRouter(r *gin.RouterGroup) {
	// TODO: Register authenticated admin routes
	// This is a Hello World example - implement your routes here
}

