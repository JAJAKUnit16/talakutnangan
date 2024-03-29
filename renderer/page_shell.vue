<template>
	<div ref="layout" class="layout">
		<ShellNav v-if="!shouldHideNavbar"/>
		<Content :class="contentClasses">
			<slot></slot>
		</Content>
		<Footer v-if="!shouldHideFooter" class="page-shell-footer"/>
	</div>
</template>

<style lang="scss">
@import 'material-icons/iconfont/material-icons.css';
@import "@styles/variables.scss";

body {
	margin: 0;
	font-family: sans-serif;

	&.dark #app {
		@apply text-light-50 bg-dark-700;

	}
}
*, *::before, *::after {
	box-sizing: border-box;
}

a {
	text-decoration: none;
}

</style>

<style scoped lang="scss">
.layout {
	@apply flex flex-col;
}

.demarginalized-top {
	margin-top: 0;
	padding: 0;
}
.marginalized-bottom {
	margin-bottom: 65.5px;
}
</style>

<script lang="ts" setup>
import { onMounted, provide, ref } from "vue"

import { BODY_CLASSES } from "$@/constants/provided_keys"

import { usePageContext } from "#/usePageContext"
import BodyCSSClasses from "$@/external/body_css_classes"
import deserializedPageProps from "$@/helpers/deserialize_page_props"

import Footer from "@/page_shell/footer.vue"
import ShellNav from "@/page_shell/shell_nav.vue"
import Content from "@/page_shell/content_container.vue"

const pageContext = usePageContext()
const path = pageContext.urlPathname as string
const isLoggingIn = path === "/user/log_in"
const isViewingConsultationForm = path.includes("/consultation/form")
const isOnCallPage = path.includes("/consultation/call")
const shouldHideNavbar
	= isLoggingIn
	|| isViewingConsultationForm
	|| isOnCallPage
const shouldHideFooter
	= isViewingConsultationForm
	|| isOnCallPage
	|| path.includes("/consultation/report")
const contentClasses = {
	"demarginalized-top": shouldHideNavbar,
	"marginalized-bottom": isOnCallPage
}


const layout = ref<HTMLElement | null>(null)
const bodyClasses = ref<BodyCSSClasses | null>(null)
onMounted(() => {
	if (layout.value) {
		// ! Risky
		bodyClasses.value = new BodyCSSClasses(
			layout.value.parentElement?.parentElement as HTMLBodyElement
		)
	}
})
provide("pageContext", deserializedPageProps(pageContext))
provide(BODY_CLASSES, bodyClasses)
</script>
