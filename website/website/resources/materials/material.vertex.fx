﻿precision highp float;

// Attributes
attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif

#include<bonesDeclaration>

// Uniforms
#include<instancesDeclaration>

uniform mat4 view;
uniform mat4 viewProjection;

#ifdef TEXTURE
// YOUR TEXTURE(S) HERE including:
// - your texture matrix
// - your texture infos
varying vec2 vMyTextureUV;
uniform mat4 myTextureMatrix;
uniform vec2 vMyTextureInfos;
#endif

#ifdef POINTSIZE
uniform float pointSize;
#endif

// Output
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif

#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif

#include<clipPlaneVertexDeclaration>

#include<fogVertexDeclaration>
#include<shadowsVertexDeclaration>[0..maxSimultaneousLights]

uniform float time;

void main(void) {

	#include<instancesVertex>
	#include<bonesVertex>

    vec3 pos = position;
    
    // The ultimate waves function
    pos.y += (sin(((pos.x / 0.05) + time * 0.01)) * 2.0)
           + (cos(((pos.z / 0.05) + time * 0.01)) * 2.0);
            
	gl_Position = viewProjection * finalWorld * vec4(pos, 1.0);

	vec4 worldPos = finalWorld * vec4(pos, 1.0);
	vPositionW = vec3(worldPos);

	#ifdef NORMAL
		vNormalW = normalize(vec3(finalWorld * vec4(normal, 0.0)));
	#endif

	// Texture coordinates
	#ifndef UV1
		vec2 uv = vec2(0., 0.);
	#endif
	#ifndef UV2
		vec2 uv2 = vec2(0., 0.);
	#endif

	#ifdef TEXTURE
		if (vMyTextureInfos.x == 0.)
		{
			vMyTextureUV = vec2(myTextureMatrix * vec4(uv, 1.0, 0.0));
		}
		else
		{
			vMyTextureUV = vec2(myTextureMatrix * vec4(uv2, 1.0, 0.0));
		}
	#endif

		// Clip plane
	#include<clipPlaneVertex>

    // Fog
	#include<fogVertex>
	#include<shadowsVertex>[0..maxSimultaneousLights]

	// Vertex color
	#ifdef VERTEXCOLOR
		vColor = color;
	#endif

	// Point size
	#ifdef POINTSIZE
		gl_PointSize = pointSize;
	#endif
}
