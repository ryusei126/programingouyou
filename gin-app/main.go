package main

import (
	"log"

	"example.com/gin-app/src"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// ルータ初期化
	router := gin.Default()

	// DB初期化
	if err := src.InitDB(); err != nil {
		log.Fatal(err)
	}

	// CORS設定
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	// デフォルト、静的ファイル配信
	router.GET("/", func(c *gin.Context) {
		c.File("./static/index.html")
	})
	router.NoRoute(func(c *gin.Context) {
		path := "./static" + c.Request.URL.Path
		c.File(path)
	})

	src.RegisterAuthRoutes(router)
	router.Use(src.SupabaseAuthMiddleware())
	src.RegisterMemoRoutes(router)

	// アプリケーションの実行
	var port string = src.Config.ServerPort
	log.Println("Server started on http://localhost:" + port)
	router.Run(":" + port)
}
